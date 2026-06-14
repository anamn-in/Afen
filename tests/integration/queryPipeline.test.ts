import request from 'supertest';
import { app } from '@api/Server';
import { generateMockPayload } from '../helpers/mockPayloads';

describe('Query Pipeline', () => {
  it('executes EXPLAIN latest', async () => {
    const payload = generateMockPayload('javascript');
    await request(app).post('/ingest').send(payload);
    const res = await request(app).post('/query').send({ query: 'EXPLAIN latest' });
    expect(res.status).toBe(200);
    expect(res.body.rootCause).toBeDefined();
  });
});