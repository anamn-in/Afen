import fastify, { FastifyInstance } from 'fastify';
import {
  queryRoute,
  healthRoute,
  reportRoute,
  graphRoute,
  rootCausesRoute,
  ingestRoute,
} from './routes';

export const app: FastifyInstance = fastify({
  logger: true,
  bodyLimit: 10 * 1024 * 1024,
});

app.register(queryRoute, { prefix: '/query' });
app.register(healthRoute, { prefix: '/health' });
app.register(reportRoute, { prefix: '/report' });
app.register(graphRoute, { prefix: '/graph' });
app.register(rootCausesRoute, { prefix: '/root-causes' });
app.register(ingestRoute, { prefix: '/ingest' });

app.get('/ping', async () => {
  return 'pong';
});

export class ApiServer {
  private port: number;
  private host: string;

  constructor(
    port: number = parseInt(process.env.AFEN_RUNTIME_PORT || process.env.PORT || '8787', 10),
    host: string = '127.0.0.1'
  ) {
    this.port = port;
    this.host = host;
  }

  async start(): Promise<void> {
    try {
      await app.listen({ port: this.port, host: this.host });
      console.log(`Afen API server running on http://${this.host}:${this.port}`);
    } catch (err) {
      console.error('Failed to start server:', err);
      throw err;
    }
  }
}