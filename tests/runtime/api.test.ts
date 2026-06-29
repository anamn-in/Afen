import request from 'supertest';
import { RuntimeServer } from '../../src/runtime/RuntimeServer';
import { DialectClient } from '../../src/storage/DialectClient';
import { Migrator } from '../../src/storage/Migrator';
import { Express } from 'express';

// Use in-memory DB for tests
const TEST_DB_PATH = ':memory:';

let server: RuntimeServer;
let app: Express;

const VALID_PAYLOAD = {
  errorType: 'TypeError',
  message: 'Cannot read properties of null',
  stackTraceRaw:
    'TypeError: Cannot read properties of null\n    at processUser (users.js:45:12)\n    at handleRequest (server.js:23:5)\n    at Layer.handle (express/lib/router/layer.js:95:5)',
  language: 'javascript',
};

beforeAll(async () => {
  process.env.DB_PATH = TEST_DB_PATH;
  await Migrator.run();
  server = new RuntimeServer(9999);
  app = server.getApp();
});

afterAll(() => {
  const client = DialectClient.getInstance();
  client.close();
});

describe('Runtime API', () => {
  test('GET /health returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'afen-runtime' });
  });

  test('GET /status before ingest', async () => {
    const res = await request(app).get('/status');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      runtime: 'running',
      address: expect.stringContaining('9999'),
    });
    expect(res.body.errorsStored).toBeDefined();
    expect(res.body.graphNodes).toBeDefined();
  });

  test('POST /ingest valid payload with stack', async () => {
    const res = await request(app).post('/ingest').send(VALID_PAYLOAD);
    expect(res.status).toBe(202);
    expect(res.body.id).toBeDefined();
    expect(res.body.fingerprint).toBeDefined();
    expect(res.body.rootCause).toBeDefined();
    expect(res.body.rootCause.frame).toContain('processUser @ users.js:45');
    expect(res.body.rootCause.isVendor).toBe(false);
    expect(res.body.rootCause.confidence).toBeGreaterThanOrEqual(0);
    expect(res.body.rootCause.confidence).toBeLessThanOrEqual(1);
  });

  test('POST /ingest missing message', async () => {
    const payload = { errorType: 'TypeError' };
    const res = await request(app).post('/ingest').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('POST /ingest missing errorType', async () => {
    const payload = { message: 'Something went wrong' };
    const res = await request(app).post('/ingest').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('GET /errors after ingest', async () => {
    await request(app).post('/ingest').send(VALID_PAYLOAD);
    const res = await request(app).get('/errors');
    expect(res.status).toBe(200);
    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors.length).toBeGreaterThan(0);
    const first = res.body.errors[0];
    expect(first.id).toBeDefined();
    expect(first.errorType).toBeDefined();
  });

  test('GET /errors/:id valid id', async () => {
    const ingestRes = await request(app).post('/ingest').send(VALID_PAYLOAD);
    const id = ingestRes.body.id;
    const res = await request(app).get(`/errors/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.error.id).toBe(id);
  });

  test('GET /errors/:id unknown id', async () => {
    const res = await request(app).get('/errors/unknown-id');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  test('GET /graph after ingest with stack', async () => {
    await request(app).post('/ingest').send(VALID_PAYLOAD);
    const res = await request(app).get('/graph');
    expect(res.status).toBe(200);
    expect(res.body.nodes).toBeInstanceOf(Array);
    expect(res.body.edges).toBeInstanceOf(Array);
    expect(res.body.nodes.length).toBeGreaterThan(0);
    expect(res.body.edges.length).toBeGreaterThan(0);
    const vendorNode = res.body.nodes.find((n: any) => n.data.metadata?.isVendor === true);
    expect(vendorNode).toBeDefined();
    const appNode = res.body.nodes.find((n: any) => n.data.metadata?.isVendor === false);
    expect(appNode).toBeDefined();
  });

  test('GET /root-causes after ingest', async () => {
    await request(app).post('/ingest').send(VALID_PAYLOAD);
    const res = await request(app).get('/root-causes');
    expect(res.status).toBe(200);
    expect(res.body.rootCauses).toBeInstanceOf(Array);
    expect(res.body.rootCauses.length).toBeGreaterThan(0);
    const rc = res.body.rootCauses[0];
    expect(rc.frame).toBeDefined();
    expect(rc.confidence).toBeDefined();
    expect(rc.isVendor).toBeDefined();
    expect(rc.recommendation).toBeDefined();
    expect(rc.confidence).toBeGreaterThanOrEqual(0);
    expect(rc.confidence).toBeLessThanOrEqual(1);
  });

  test('POST /query valid AQL', async () => {
    const res = await request(app).post('/query').send({ query: 'SELECT * FROM trace' });
    expect(res.status).toBe(200);
    expect(res.body.ast).toBeDefined();
    expect(res.body.ast.type).toBe('select');
  });

  test('POST /query missing query field', async () => {
    const res = await request(app).post('/query').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});