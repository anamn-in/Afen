import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function healthRoute(app: FastifyInstance): Promise<void> {
  app.get('/', async (req: FastifyRequest, reply: FastifyReply) => {
    return reply.send({ status: 'ok', timestamp: new Date().toISOString() });
  });
}