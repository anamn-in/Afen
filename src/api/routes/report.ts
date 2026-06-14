import { Router, Request, Response } from 'express';
import { EventDao } from '@storage/daos/EventDao';

const router = Router();
const eventDao = new EventDao();

router.get('/:id', (req: Request, res: Response) => {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const events = eventDao.findByFingerprint(id, 1);
  if (events.length === 0) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json({
    id,
    event: events[0],
  });
});

export { router as ReportRoute };