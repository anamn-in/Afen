import request from 'supertest';
import { app } from '@api/Server';
import { generateMockPayload } from '../helpers/mockPayloads';

describe('End-to-End', () => {
  it('full flow: ingest -> query -> report', async () => {
    const payload = generateMockPayload('python');
    const ingestRes = await request(app).post('/ingest').send(payload);
    const fingerprint = ingestRes.body.fingerprint.systemVariant;
    const queryRes = await request(app).post('/query').send({ query: `CAUSE ${fingerprint}` });
    expect(queryRes.status).toBe(200);
    expect(queryRes.body.candidates).toBeDefined();
  });
});