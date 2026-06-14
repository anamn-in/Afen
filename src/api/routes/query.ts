import { Router, Request, Response } from 'express';
import { KTAnalysis } from '@core/engines/KTAnalysis';
import { EventDao } from '@storage/daos/EventDao';
import { NormalizedUIREvent } from '@models/uir/UIREvent';

const router = Router();
const ktAnalysis = new KTAnalysis();
const eventDao = new EventDao();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Missing query string' });
    }

    if (query.match(/^EXPLAIN\s+latest$/i)) {
      const fingerprint = eventDao.getLatestFingerprint();
      if (!fingerprint) {
        return res.json({ error: 'No events have been ingested yet' });
      }
      const result = ktAnalysis.fastMode(fingerprint);
      const topCandidate = result.rootCauseCandidates[0];
      const cascades = topCandidate?.evidence || [];
      return res.json({
        rootCause: {
          nodeId: topCandidate?.nodeId || 'unknown',
          cascades,
        },
        recommendation: cascades.includes('Historical recurrence')
          ? 'Check recent deployments and fix the recurring error pattern.'
          : 'Review the error trace and apply the suggested fix.',
      });
    }

    const causeMatch = query.match(/^CAUSE\s+(\S+)/i);
    if (causeMatch) {
      const fingerprint = causeMatch[1];
      const result = ktAnalysis.fastMode(fingerprint);
      return res.json({ candidates: result.rootCauseCandidates });
    }

    const traceMatch = query.match(/^TRACE\s+(\S+)/i);
    if (traceMatch) {
      const fingerprint = traceMatch[1];
      const events = eventDao.findByFingerprint(fingerprint, 10);
      const chain = events.map((e: NormalizedUIREvent) => ({
        id: e.id,
        timestamp: e.ingestedAt,
        stack: e.normalizedStack.map((f) => f.functionName),
      }));
      return res.json({ chain });
    }

    res.json({ message: `Command '${query}' not implemented yet` });
  } catch (err) {
    console.error('[Query Error]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as QueryRoute };