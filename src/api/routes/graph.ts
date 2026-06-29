import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { graphStoreInstance } from '@core/graph/GraphStoreInstance';

export async function graphRoute(app: FastifyInstance): Promise<void> {
  app.get('/', async (req: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      nodes: graphStoreInstance.getAllNodes(),
      edges: graphStoreInstance.getAllEdges(),
    });
  });
}