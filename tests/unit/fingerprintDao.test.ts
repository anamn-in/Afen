import { FingerprintDao } from '@storage/daos/FingerprintDao';

describe('FingerprintDao', () => {
  let dao: FingerprintDao;

  beforeEach(() => {
    dao = new FingerprintDao();
  });

  it('records a fingerprint and returns correct stats', () => {
    const fp = 'record-test-fp';
    const ts = Date.now();
    dao.record(fp, ts);
    const stats = dao.getStats(fp);
    expect(stats).toBeDefined();
    expect(stats!.count).toBe(1);
    expect(stats!.first_seen).toBe(ts);
    expect(stats!.last_seen).toBe(ts);
    expect(stats!.resolved).toBe(0);
  });

  it('increments count on duplicate record and updates last_seen', () => {
    const fp = 'dup-test-fp';
    const ts = Date.now();
    dao.record(fp, ts);
    const laterTs = ts + 1000;
    dao.record(fp, laterTs);
    const stats = dao.getStats(fp);
    expect(stats!.count).toBe(2);
    expect(stats!.last_seen).toBe(laterTs);
    expect(stats!.first_seen).toBe(ts);
  });

  it('marks fingerprint as resolved', () => {
    const fp = 'resolve-test-fp';
    const ts = Date.now();
    dao.record(fp, ts);
    dao.markResolved(fp);
    const stats = dao.getStats(fp);
    expect(stats!.resolved).toBe(1);
  });

  it('returns undefined for non-existent fingerprint', () => {
    const stats = dao.getStats('non-existent');
    expect(stats).toBeUndefined();
  });
});