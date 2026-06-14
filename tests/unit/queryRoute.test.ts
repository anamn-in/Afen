import request from 'supertest';
import express from 'express';
import { QueryRoute } from '@api/routes/query';
import { EventDao } from '@storage/daos/EventDao';
import { generateMockPayload } from '../helpers/mockPayloads';
import { UIRPipeline } from '@models/uir/UIRPipeline';

describe('Query Route', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/query', QueryRoute);
  });

  it('returns 400 when body has no query', async () => {
    const res = await request(app).post('/query').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing query string');
  });

  it('returns 400 when query is not a string', async () => {
    const res = await request(app).post('/query').send({ query: 123 });
    expect(res.status).toBe(400);
  });

  it('EXPLAIN latest returns error when no events ingested', async () => {
    const res = await request(app).post('/query').send({ query: 'EXPLAIN latest' });
    expect(res.status).toBe(200);
    expect(res.body.error).toBe('No events have been ingested yet');
  });

  it('EXPLAIN latest returns root cause after ingestion', async () => {
    const pipeline = new UIRPipeline();
    const payload = generateMockPayload('javascript', 'test error');
    await pipeline.processRawPayload(payload);
    const res = await request(app).post('/query').send({ query: 'EXPLAIN latest' });
    expect(res.status).toBe(200);
    expect(res.body.rootCause).toBeDefined();
    expect(res.body.recommendation).toBeDefined();
  });

  it('CAUSE returns candidates', async () => {
    const pipeline = new UIRPipeline();
    const payload = generateMockPayload('python', 'test');
    const event = await pipeline.processRawPayload(payload);
    const fingerprint = event.fingerprint.systemVariant;
    const res = await request(app).post('/query').send({ query: `CAUSE ${fingerprint}` });
    expect(res.status).toBe(200);
    expect(res.body.candidates).toBeDefined();
    expect(Array.isArray(res.body.candidates)).toBe(true);
  });

  it('TRACE returns chain', async () => {
    const pipeline = new UIRPipeline();
    const payload = generateMockPayload('javascript', 'test');
    const event = await pipeline.processRawPayload(payload);
    const fingerprint = event.fingerprint.systemVariant;
    const res = await request(app).post('/query').send({ query: `TRACE ${fingerprint}` });
    expect(res.status).toBe(200);
    expect(res.body.chain).toBeDefined();
    expect(Array.isArray(res.body.chain)).toBe(true);
  });

  it('unknown command returns message', async () => {
    const res = await request(app).post('/query').send({ query: 'UNKNOWN command' });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('not implemented yet');
  });
});