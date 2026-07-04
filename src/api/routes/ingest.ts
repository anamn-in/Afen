import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { RuntimeCollector } from '@core/engines/RuntimeCollector';
import { UIRPipeline } from '@models/uir/UIRPipeline';
import { GraphBuilder } from '@core/graph/GraphBuilder';
import { graphStoreInstance } from '@core/graph/GraphStoreInstance';

const collector = new RuntimeCollector();
const pipeline = new UIRPipeline();
const graphBuilder = new GraphBuilder(graphStoreInstance);

export async function ingestRoute(app: FastifyInstance): Promise<void> {
  app.post('/', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = req.body as any;
      const { errorType, message, stackTraceRaw, stack, language } = body;

      const rawStack = stackTraceRaw || stack;
      if (!rawStack) {
        return reply.status(400).send({
          error: 'Stack is missing! Request Body keys: ' + Object.keys(body).join(', '),
        });
      }

      const rawStackLines = Array.isArray(rawStack)
        ? rawStack.map(String)
        : String(rawStack).split(/\r?\n/);

      const payload = {
        message: message || 'No message provided',
        errorType: errorType || 'UnknownError',
        stackTraceRaw: rawStack,
        language: language || 'javascript',
        environment: body.environment || { name: 'unknown', version: 'unknown' },
        processInfo: body.processInfo || { pid: 0, uptime: 0 },
        timestamp: body.timestamp || Date.now(),
      };

      const uirEvent = await pipeline.processRawPayload(payload);
      await collector.ingest(payload);

      graphBuilder.build({
        nodes: [
          {
            id: uirEvent.fingerprint.systemVariant,
            type: uirEvent.errorType,
            label: uirEvent.message,
            metadata: {
              causeChain: uirEvent.causeChain,
              stackTraceRaw: rawStackLines,
              language: payload.language,
            },
          },
        ],
        edges: (uirEvent.causeChain?.stackFrames ?? []).slice(1).map((frame: any, i: number) => ({
          from:
            (uirEvent.causeChain.stackFrames[i].filename || uirEvent.causeChain.stackFrames[i].raw) ??
            'unknown',
          to: (frame.filename || frame.raw) ?? 'unknown',
          type: 'CALL',
        })),
      });

      const deduplicationCount = pipeline.getDeduplicationCount(uirEvent.fingerprint.systemVariant);

      return reply.status(200).send({
        status: 'accepted',
        id: uirEvent.id,
        fingerprint: uirEvent.fingerprint,
        deduplicationCount,
      });
    } catch (err) {
      console.error('[Ingest Error]', err);
      return reply.status(500).send({ error: 'Internal processing error' });
    }
  });
}