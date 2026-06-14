import request from 'supertest';
import { app } from '@api/Server';
import { generateMockPayload } from '../helpers/mockPayloads';

describe('Integration Pipeline', () => {
  it('accepts a valid JavaScript payload', async () => {
    const payload = generateMockPayload('javascript');
    const res = await request(app).post('/ingest').send(payload);
    expect(res.status).toBe(202);
    expect(res.body.status).toBe('accepted');
    expect(res.body.id).toBeDefined();
  });

  it('rejects malformed payload', async () => {
    const res = await request(app).post('/ingest').send({ foo: 'bar' });
    expect(res.status).toBe(400);
  });
});