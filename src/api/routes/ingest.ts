import { Router, Request, Response } from 'express';
import { RuntimeCollector } from '@core/engines/RuntimeCollector';
import { UIRPipeline } from '@models/uir/UIRPipeline';

const router = Router();
const collector = new RuntimeCollector();
const pipeline = new UIRPipeline();

// Global express.json() in Server.ts handles body parsing — no inline json() here
router.post('/', async (req: Request, res: Response) => {
  try {
    const { errorType, message, stack, language } = req.body;

    if (!stack) {
      return res.status(400).json({
        error: 'Stack is missing! Request Body keys: ' + Object.keys(req.body).join(', ')
      });
    }

    const payload = {
      message: message || 'No message provided',
      errorType: errorType || 'UnknownError',
      stackTraceRaw: stack,
      language: language || 'javascript',
      environment: req.body.environment || { name: 'unknown', version: 'unknown' },
      processInfo: req.body.processInfo || { pid: 0, uptime: 0 },
      timestamp: req.body.timestamp || Date.now(),
    };

    const uirEvent = await pipeline.processRawPayload(payload);
    await collector.ingest(payload);
    const deduplicationCount = pipeline.getDeduplicationCount(uirEvent.fingerprint.systemVariant);

    res.status(200).json({
      status: 'accepted',
      id: uirEvent.id,
      fingerprint: uirEvent.fingerprint,
      deduplicationCount,
    });
  } catch (err) {
    console.error('[Ingest Error]', err);
    res.status(500).json({ error: 'Internal processing error' });
  }
});

export { router as IngestRoute };
