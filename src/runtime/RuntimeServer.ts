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
    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({ status: 'ok', service: 'afen-runtime' });
    });

    this.app.get('/status', async (_req: Request, res: Response) => {
      try {
        const errorCount = this.eventDao.getCount();
        const graphNodeCount = this.graphStore.getAllNodes().length;

        res.json({
          runtime: 'running',
          address: `http://127.0.0.1:${this.port}`,
          errorsStored: errorCount,
          graphNodes: graphNodeCount,
        });
      } catch (_err) {
        res.status(500).json({ error: 'Failed to get status' });
      }
    });

    this.app.post('/ingest', async (_req: Request, _res: Response) => {
      // Existing ingest implementation belongs to the active Fastify API path.
      // RuntimeServer is retained for compatibility/testing only.
    });

    this.app.get('/root-causes', async (_req: Request, res: Response) => {
      res.json({ rootCauses: this.rootCauses });
    });

    this.app.get('/graph', async (_req: Request, res: Response) => {
      try {
        const nodes = this.graphStore.getAllNodes();
        const edges = this.graphStore.getAllEdges();
        res.json({ nodes, edges });
      } catch (_err) {
        res.status(500).json({ error: 'Failed to fetch graph' });
      }
    });

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

    this.shutdown = this.shutdown.bind(this);
    process.on('SIGTERM', this.shutdown);
    process.on('SIGINT', this.shutdown);
  }

  private async hydrateGraph(): Promise<void> {
    try {
      logger.info('[Runtime] Hydrating graph from database...');

      const events = this.eventDao.findAll(1000);
      if (events.length === 0) {
        logger.info('[Runtime] No events to hydrate.');
        return;
      }

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
              metadata: {
                frameKey: key,
                isVendor,
                file: frame.filename,
                function: frame.functionName,
                line: frame.lineNumber,
              },
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
                metadata: {
                  frameKey: callerKey,
                  isVendor,
                  file: callerFrame.filename,
                  function: callerFrame.functionName,
                  line: callerFrame.lineNumber,
                },
              };

              callerNode = new GraphNode(callerId, callerData);
              localNodes.push(callerNode);
            }

            const edgeId = `${callerNode.id}->${node.id}:call`;
            const edge = new GraphEdge(edgeId, {
              from: callerNode.id,
              to: node.id,
              type: 'call',
            });

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
    }
  }

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
      return;
    }

    process.exit(0);
  }

  async start(): Promise<void> {
    await this.hydrateGraph();

    this.server = this.app.listen(this.port, '127.0.0.1', () => {
      logger.info(`[Runtime] AFEN Runtime listening on http://127.0.0.1:${this.port}`);
    });
  }
}