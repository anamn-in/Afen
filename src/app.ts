import express, { Express } from 'express';
import { IngestRoute, QueryRoute, ReportRoute, HealthRoute } from './api/routes';
import { errorBoundary, requestLogger } from './api/middleware';

export const app: Express = express();

app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);
app.use(errorBoundary);

app.use('/ingest', IngestRoute);
app.use('/query', QueryRoute);
app.use('/report', ReportRoute);
app.use('/health', HealthRoute);