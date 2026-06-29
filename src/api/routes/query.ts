import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Parser } from '@models/ast/Parser';

export async function queryRoute(app: FastifyInstance): Promise<void> {
  app.post('/', async (req: FastifyRequest, reply: FastifyReply) => {
    const body = req.body as { query?: string };
    if (!body?.query || typeof body.query !== 'string') {
      return reply.status(400).send({ error: 'Missing query string' });
    }
    try {
      const parser = new Parser();
      const ast = parser.parse(body.query);
      return reply.send({ ast });
    } catch (err) {
      return reply.status(400).send({
        error: 'Invalid AQL Syntax',
        details: (err as Error).message,
      });
    }
  });
}