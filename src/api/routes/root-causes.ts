import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { graphStoreInstance } from '@core/graph/GraphStoreInstance';
import { RootCauseAnalyzer } from '@core/rootCause/RootCauseAnalyzer';
import { EventDao } from '@storage/daos/EventDao';

const eventDao = new EventDao();
const analyzer = new RootCauseAnalyzer(graphStoreInstance);

export async function rootCausesRoute(app: FastifyInstance): Promise<void> {
  app.get('/', async (req: FastifyRequest, reply: FastifyReply) => {
    const fingerprint = eventDao.getLatestFingerprint();
    if (!fingerprint) {
      return reply.send({ rootCauses: [] });
    }
    const report = analyzer.analyze({
      errorNodeId: fingerprint,
      maxDepth: 10,
      minConfidence: 0.0,
    });
    return reply.send({ rootCauses: report.rankedCandidates });
  });
}