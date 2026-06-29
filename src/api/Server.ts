import Fastify, { FastifyInstance } from 'fastify';
import { queryRoute } from './routes/query';
import { healthRoute } from './routes/health';
import { reportRoute } from './routes/report';

export class ApiServer {
  private app: FastifyInstance;
  private port: number;
  private host: string;

  constructor(
    port: number = parseInt(process.env.AFEN_RUNTIME_PORT || '8787', 10),
    host: string = '127.0.0.1'
  ) {
    this.port = port;
    this.host = host;
    this.app = Fastify({ logger: true });
    this.app.register(queryRoute, { prefix: '/query' });
    this.app.register(healthRoute, { prefix: '/health' });
    this.app.register(reportRoute, { prefix: '/report' });
  }

  async start(): Promise<void> {
    await this.app.listen({ port: this.port, host: this.host });
    console.log(`Afen API server running on http://${this.host}:${this.port}`);
  }
}