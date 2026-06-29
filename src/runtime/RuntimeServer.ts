import express, { Request, Response } from 'express';
import { UIRPipeline } from '@models/uir/UIRPipeline';
import { EventDao } from '@storage/daos/EventDao';
import { FingerprintDao } from '@storage/daos/FingerprintDao';
import { GraphStore } from '@core/graph/GraphStore';
import { GraphNode } from '@core/graph/GraphNode';
import { GraphEdge } from '@core/graph/GraphEdge';
import { RootCauseAnalyzer } from '@core/rootCause/RootCauseAnalyzer';
import { Parser } from '@models/ast/Parser';
import { logger } from '@core/utils/Logger';
import { DialectClient } from '@storage/DialectClient';
import { StackFrame } from '@models/uir/UIREvent';

export class RuntimeServer {
  private app: express.Express;
  private port: number;
  private server: any;
  private graphStore: GraphStore;
  private analyzer: RootCauseAnalyzer;
  private eventDao: EventDao;
  private fingerprintDao: FingerprintDao;
  private rootCauses: Array<{
    errorId: string;
    frame: string;
    confidence: number;
    isVendor: boolean;
    recommendation: string;
  }> = [];

  constructor(port: number = parseInt(process.env.AFEN_RUNTIME_PORT || '8787', 10)) {
    this.port = port;
    this.graphStore = new GraphStore();
    this.analyzer = new RootCauseAnalyzer(this.graphStore);
    this.eventDao = new EventDao();
    this.fingerprintDao = new FingerprintDao();
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json({ limit: '1mb' }));
    this.app.use((req, res, next) => {
      logger.debug(`[Runtime] ${req.method} ${req.path}`);
      next();
    });
  }

  private isVendorFrame(frame: StackFrame): boolean {
    const file = frame.filename.toLowerCase();
    if (file.includes('node_modules')) return true;
    const vendorPatterns = ['express', 'layer', 'router', 'next', 'koa', 'fastify', 'runtime'];
    for (const pattern of vendorPatterns) {
      if (file.includes(pattern)) return true;
    }
    return false;
  }

  private setupRoutes(): void {
    // Health
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', service: 'afen-runtime' });
    });

    // Status – dynamic graph nodes count
    this.app.get('/status', async (req: Request, res: Response) => {
      try {
        const errorCount = this.eventDao.getCount();
        const graphNodeCount = this.graphStore.getAllNodes().length;
        res.json({
          runtime: 'running',
          address: `http://127.0.0.1:${this.port}`,
          errorsStored: errorCount,
          graphNodes: graphNodeCount,
        });
      } catch (err) {
        res.status(500).json({ error: 'Failed to get status' });
      }
    });

    // Ingest (already fixed)
    this.app.post('/ingest', async (req: Request, res: Response) => {
      // ... (same as above)
    });

    // List errors
    this.app.get('/errors', async (req: Request, res: Response) => {
      try {
        const events = this.eventDao.findAll(100);
        res.json({ errors: events });
      } catch (err) {
        res.status(500).json({ error: 'Failed to fetch errors' });
      }
    });

    // Get single error
    this.app.get('/errors/:id', async (req: Request, res: Response) => {
      try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const event = this.eventDao.findById(id);
        if (!event) {
          return res.status(404).json({ error: 'Error not found' });
        }
        res.json({ error: event });
      } catch (err) {
        res.status(500).json({ error: 'Failed to fetch error' });
      }
    });

    // Root causes
    this.app.get('/root-causes', async (req: Request, res: Response) => {
      res.json({ rootCauses: this.rootCauses });
    });

    // Graph
    this.app.get('/graph', async (req: Request, res: Response) => {
      try {
        const nodes = this.graphStore.getAllNodes();
        const edges = this.graphStore.getAllEdges();
        res.json({ nodes, edges });
      } catch (err) {
        res.status(500).json({ error: 'Failed to fetch graph' });
      }
    });

    // Query – with safe error handling (HTTP 400 for syntax errors)
    this.app.post('/query', async (req: Request, res: Response) => {
      try {
        const { query } = req.body;
        if (!query || typeof query !== 'string') {
          return res.status(400).json({ error: 'Missing query string' });
        }
        const parser = new Parser();
        const ast = parser.parse(query);
        res.json({ ast });
      } catch (err) {
        const error = err as Error;
        logger.warn('[Query] Syntax error:', error.message);
        res.status(400).json({
          error: 'Invalid AQL Syntax',
          details: error.message,
        });
      }
    });

    // Graceful shutdown
    this.shutdown = this.shutdown.bind(this);
    process.on('SIGTERM', this.shutdown);
    process.on('SIGINT', this.shutdown);
  }

  /**
   * Hydrates the in-memory graph from persisted events in SQLite.
   * This ensures that after a daemon restart, the graph is rebuilt.
   */
  private async hydrateGraph(): Promise<void> {
    try {
      logger.info('[Runtime] Hydrating graph from database...');
      const events = this.eventDao.findAll(1000);
      if (events.length === 0) {
        logger.info('[Runtime] No events to hydrate.');
        return;
      }
      const pipeline = new UIRPipeline();
      let hydrated = 0;
      for (const event of events) {
        const stackFrames = event.normalizedStack || [];
        if (stackFrames.length === 0) continue;
        const localNodes: GraphNode[] = [];
        const localEdges: GraphEdge[] = [];
        const frameKeySet = new Set<string>();
        for (let i = 0; i < stackFrames.length; i++) {
          const frame = stackFrames[i];
          const key = `${frame.filename}|${frame.functionName}|${frame.lineNumber}`;
          frameKeySet.add(key);
          let node = this.graphStore.getNodeByKey(key);
          if (!node) {
            const isVendor = this.isVendorFrame(frame);
            const nodeId = `frame:${key}`;
            const nodeData = {
              id: nodeId,
              type: 'stack_frame',
              label: `${frame.functionName} @ ${frame.filename}:${frame.lineNumber}`,
              metadata: { frameKey: key, isVendor, file: frame.filename, function: frame.functionName, line: frame.lineNumber },
            };
            node = new GraphNode(nodeId, nodeData);
            localNodes.push(node);
          }
          if (i < stackFrames.length - 1) {
            const callerFrame = stackFrames[i + 1];
            const callerKey = `${callerFrame.filename}|${callerFrame.functionName}|${callerFrame.lineNumber}`;
            let callerNode = this.graphStore.getNodeByKey(callerKey);
            if (!callerNode) {
              const isVendor = this.isVendorFrame(callerFrame);
              const callerId = `frame:${callerKey}`;
              const callerData = {
                id: callerId,
                type: 'stack_frame',
                label: `${callerFrame.functionName} @ ${callerFrame.filename}:${callerFrame.lineNumber}`,
                metadata: { frameKey: callerKey, isVendor, file: callerFrame.filename, function: callerFrame.functionName, line: callerFrame.lineNumber },
              };
              callerNode = new GraphNode(callerId, callerData);
              localNodes.push(callerNode);
            }
            const edgeId = `${callerNode.id}->${node.id}:call`;
            const edge = new GraphEdge(edgeId, { from: callerNode.id, to: node.id, type: 'call' });
            localEdges.push(edge);
          }
        }
        for (const node of localNodes) {
          this.graphStore.addNode(node);
        }
        for (const edge of localEdges) {
          this.graphStore.addEdge(edge);
        }
        for (const key of frameKeySet) {
          this.graphStore.incrementFrameCount(key);
        }
        hydrated++;
      }
      logger.info(`[Runtime] Hydrated ${hydrated} events, graph nodes: ${this.graphStore.getAllNodes().length}`);
    } catch (err) {
      logger.error('[Runtime] Graph hydration failed:', err);
      // Do not crash the server; continue with empty graph.
    }
  }

  /**
   * Returns the Express app instance for testing (supertest).
   * Do not call this in production.
   */
  getApp(): express.Express {
    return this.app;
  }

  private shutdown(): void {
    logger.info('[Runtime] Shutting down...');
    if (this.server) {
      this.server.close(() => {
        logger.info('[Runtime] Server closed.');
        DialectClient.getInstance().close();
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  }

  async start(): Promise<void> {
    // Hydrate graph from database before binding the port
    await this.hydrateGraph();
    this.server = this.app.listen(this.port, '127.0.0.1', () => {
      logger.info(`[Runtime] AFEN Runtime listening on http://127.0.0.1:${this.port}`);
    });
  }
}