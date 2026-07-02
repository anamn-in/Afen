import { app } from '../../src/api/Server';
import { generateMockPayload } from '../helpers/mockPayloads';

describe('End-to-End', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('full flow: ingest -> query -> graph -> root-causes', async () => {
    const payload = generateMockPayload('python');

    const ingestRes = await app.inject({
      method: 'POST',
      url: '/ingest',
      payload,
    });

    expect(ingestRes.statusCode).toBe(200);

    const ingestBody = JSON.parse(ingestRes.body);
    expect(ingestBody.status).toBe('accepted');
    expect(ingestBody.fingerprint).toBeDefined();

    const queryRes = await app.inject({
      method: 'POST',
      url: '/query',
      payload: { query: 'SELECT * FROM errors LIMIT 10' },
    });

    expect(queryRes.statusCode).toBe(200);

    const queryBody = JSON.parse(queryRes.body);
    expect(queryBody.ast).toBeDefined();
    expect(queryBody.ast.type).toBe('select');

    const graphRes = await app.inject({
      method: 'GET',
      url: '/graph',
    });

    expect(graphRes.statusCode).toBe(200);

    const graphBody = JSON.parse(graphRes.body);
    expect(graphBody.nodes).toBeInstanceOf(Array);
    expect(graphBody.edges).toBeInstanceOf(Array);

    const rootCausesRes = await app.inject({
      method: 'GET',
      url: '/root-causes',
    });

    expect(rootCausesRes.statusCode).toBe(200);

    const rootCausesBody = JSON.parse(rootCausesRes.body);
    expect(rootCausesBody.rootCauses).toBeInstanceOf(Array);
  });
});