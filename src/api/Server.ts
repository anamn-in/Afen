import Fastify from 'fastify';
import { queryRoute, healthRoute, reportRoute, graphRoute, rootCausesRoute, ingestRoute } from './routes';

export const app = Fastify({ logger: true });

app.register(queryRoute, { prefix: '/query' });
app.register(healthRoute, { prefix: '/health' });
app.register(reportRoute, { prefix: '/report' });
app.register(graphRoute, { prefix: '/graph' });
app.register(rootCausesRoute, { prefix: '/root-causes' });
app.register(ingestRoute, { prefix: '/ingest' });

app.get('/ping', async () => 'pong');

export class ApiServer {
    constructor(
        private port = parseInt(process.env.AFEN_RUNTIME_PORT || process.env.PORT || '8787', 10),
        private host = '127.0.0.1'
    ) {}

    async start() {
        try {
            await app.listen({ port: this.port, host: this.host });
            console.log(`Afen API server running on http://${this.host}:${this.port}`);
        } catch (err) {
            console.error('Failed to start server:', err);
            throw err;
        }
    }
}