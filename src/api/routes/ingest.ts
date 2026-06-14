import { Router, Request, Response } from 'express';
import { RuntimeCollector } from '@core/engines/RuntimeCollector';
import { UIRPipeline } from '@models/uir/UIRPipeline';

const router = Router();
const collector = new RuntimeCollector();
const pipeline = new UIRPipeline();

router.post('/', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!payload.message || !payload.errorType) {
      return res.status(400).json({ error: 'Missing required fields: message, errorType' });
    }
    const uirEvent = await pipeline.processRawPayload(payload);
    await collector.ingest(payload);
    const deduplicationCount = pipeline.getDeduplicationCount(uirEvent.fingerprint.systemVariant);
    res.status(202).json({
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