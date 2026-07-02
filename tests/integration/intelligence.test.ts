import { app } from '../../src/api/Server';
import { KTAnalysis } from '../../src/core/engines/KTAnalysis';
import { generateMockPayload } from '../helpers/mockPayloads';

describe('Intelligence', () => {
  const kt = new KTAnalysis();

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('fast mode returns candidates', async () => {
    const payload = generateMockPayload('javascript', 'test');

    const res = await app.inject({
      method: 'POST',
      url: '/ingest',
      payload,
    });

    expect(res.statusCode).toBe(200);

    const body = JSON.parse(res.body);
    const fingerprint = body.fingerprint.systemVariant;
    const result = kt.fastMode(fingerprint);

    expect(result.rootCauseCandidates.length).toBeGreaterThan(0);
  });
});