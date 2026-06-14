import request from 'supertest';
import { app } from '@api/Server';
import { KTAnalysis } from '@core/engines/KTAnalysis';
import { generateMockPayload } from '../helpers/mockPayloads';

describe('Intelligence', () => {
  const kt = new KTAnalysis();

  it('fast mode returns candidates', async () => {
    const payload = generateMockPayload('javascript', 'test');
    const res = await request(app).post('/ingest').send(payload);
    const fingerprint = res.body.fingerprint.systemVariant;
    const result = kt.fastMode(fingerprint);
    expect(result.rootCauseCandidates.length).toBeGreaterThan(0);
  });
});