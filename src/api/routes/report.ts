import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { EventDao } from '@storage/daos/EventDao';

const eventDao = new EventDao();

export async function reportRoute(app: FastifyInstance): Promise<void> {
  app.get('/:id', async (
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const { id } = req.params;
    const events = eventDao.findByFingerprint(id, 1);
    if (events.length === 0) {
      return reply.status(404).send({ error: 'Report not found' });
    }
    return reply.send({ id, event: events[0] });
  });
}