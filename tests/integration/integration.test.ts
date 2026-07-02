import { app } from '../../src/api/Server';
import { generateMockPayload } from '../helpers/mockPayloads';

describe('Integration Pipeline', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('accepts a valid JavaScript payload', async () => {
    const payload = generateMockPayload('javascript');

    const res = await app.inject({
      method: 'POST',
      url: '/ingest',
      payload,
    });

    expect(res.statusCode).toBe(200);

    const body = JSON.parse(res.body);
    expect(body.status).toBe('accepted');
    expect(body.id).toBeDefined();
  });

  it('rejects malformed payload', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/ingest',
      payload: { foo: 'bar' },
    });

    expect(res.statusCode).toBe(400);
  });
});