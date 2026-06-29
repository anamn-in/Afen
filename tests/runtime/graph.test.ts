import request from 'supertest';
import { RuntimeServer } from '../../src/runtime/RuntimeServer';
import { DialectClient } from '../../src/storage/DialectClient';
import { Migrator } from '../../src/storage/Migrator';
import { Express } from 'express';

// Payloads
const APP_AND_VENDOR_PAYLOAD = {
  errorType: 'TypeError',
  message: 'Cannot read properties of null',
  stackTraceRaw: [
    'at processUser (users.js:45:12)',
    'at handleRequest (server.js:23:5)',
    'at Layer.handle (express/lib/router/layer.js:95:5)',
  ].join('\n'),
  language: 'javascript',
};

const ALL_VENDOR_PAYLOAD = {
  errorType: 'TypeError',
  message: 'Framework error',
  stackTraceRaw: [
    'at Layer.handle (express/lib/router/layer.js:95:5)',
    'at Router.process_params (express/lib/router/index.js:346:12)',
  ].join('\n'),
  language: 'javascript',
};

const NO_STACK_PAYLOAD = {
  errorType: 'TypeError',
  message: 'Something went wrong',
  language: 'javascript',
};

const ERROR_MESSAGE_ONLY_STACK = {
  errorType: 'TypeError',
  message: 'x is undefined',
  stackTraceRaw: 'TypeError: x is undefined',
  language: 'javascript',
};

let server: RuntimeServer;
let app: Express;

// Reset state before each test (fresh DB + server instance)
beforeEach(async () => {
  // Close existing DialectClient and reset singleton
  const client = DialectClient.getInstance();
  client.close();
  (DialectClient as any).instance = null;
  process.env.DB_PATH = ':memory:';
  await Migrator.run();
  server = new RuntimeServer(9998);
  app = server.getApp();
});

afterAll(() => {
  // Final cleanup
  const client = DialectClient.getInstance();
  client.close();
  (DialectClient as any).instance = null;
});

describe('Graph & Root-Cause Regression Tests', () => {
  test('App frame wins over vendor frame', async () => {
    const res = await request(app).post('/ingest').send(APP_AND_VENDOR_PAYLOAD);
    expect(res.status).toBe(202);
    expect(res.body.rootCause).toBeDefined();
    expect(res.body.rootCause.isVendor).toBe(false);
    expect(res.body.rootCause.frame).toContain('processUser');
  });

  test('All vendor frames', async () => {
    const res = await request(app).post('/ingest').send(ALL_VENDOR_PAYLOAD);
    expect(res.status).toBe(202);
    // rootCause may be null or vendor, but not throw
    if (res.body.rootCause) {
      expect(res.body.rootCause.isVendor).toBe(true);
    }
  });

  test('Empty stack handled safely', async () => {
    // Get initial graph count
    const before = await request(app).get('/graph');
    expect(before.status).toBe(200);
    const beforeCount = before.body.nodes.length;

    const res = await request(app).post('/ingest').send(NO_STACK_PAYLOAD);
    expect(res.status).toBe(202);
    expect(res.body.rootCause).toBeNull();

    const after = await request(app).get('/graph');
    expect(after.status).toBe(200);
    expect(after.body.nodes.length).toBe(beforeCount);
  });

  test('Error message line produces no unknown frame', async () => {
    const res = await request(app).post('/ingest').send(ERROR_MESSAGE_ONLY_STACK);
    expect(res.status).toBe(202);

    const graphRes = await request(app).get('/graph');
    expect(graphRes.status).toBe(200);
    const hasUnknown = graphRes.body.nodes.some((n: any) =>
      n.id.includes('unknown|unknown|0')
    );
    expect(hasUnknown).toBe(false);
  });

  test('Duplicate ingestion does not double graph nodes', async () => {
    // First ingest
    const first = await request(app).post('/ingest').send(APP_AND_VENDOR_PAYLOAD);
    expect(first.status).toBe(202);
    const graph1 = await request(app).get('/graph');
    const count1 = graph1.body.nodes.length;

    // Second ingest (same payload)
    const second = await request(app).post('/ingest').send(APP_AND_VENDOR_PAYLOAD);
    expect(second.status).toBe(202);
    const graph2 = await request(app).get('/graph');
    const count2 = graph2.body.nodes.length;

    expect(count2).toBe(count1);
  });

  test('Two errors sharing a frame correlate correctly', async () => {
    const payload1 = {
      ...APP_AND_VENDOR_PAYLOAD,
      message: 'First error',
    };
    const payload2 = {
      ...APP_AND_VENDOR_PAYLOAD,
      message: 'Second error',
    };

    const res1 = await request(app).post('/ingest').send(payload1);
    expect(res1.status).toBe(202);
    expect(res1.body.rootCause).toBeDefined();

    const res2 = await request(app).post('/ingest').send(payload2);
    expect(res2.status).toBe(202);
    expect(res2.body.rootCause).toBeDefined();

    const graphRes = await request(app).get('/graph');
    expect(graphRes.status).toBe(200);
    const processUserNode = graphRes.body.nodes.find(
      (n: any) => n.data.metadata?.frameKey === 'users.js|processUser|45'
    );
    expect(processUserNode).toBeDefined();
  });

  test('Confidence is always between 0 and 1', async () => {
    const res = await request(app).post('/ingest').send(APP_AND_VENDOR_PAYLOAD);
    expect(res.status).toBe(202);
    const conf = res.body.rootCause.confidence;
    expect(conf).toBeGreaterThanOrEqual(0);
    expect(conf).toBeLessThanOrEqual(1);
  });

  test('Failed SQLite insert leaves graph unchanged', async () => {
    // Get initial node count
    const before = await request(app).get('/graph');
    expect(before.status).toBe(200);
    const beforeCount = before.body.nodes.length;

    // Spy on eventDao.insert to throw
    const eventDao = (server as any).eventDao;
    const insertSpy = jest.spyOn(eventDao, 'insert').mockImplementation(() => {
      throw new Error('SQLite insert failed');
    });

    const res = await request(app).post('/ingest').send(APP_AND_VENDOR_PAYLOAD);
    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();

    insertSpy.mockRestore();

    const after = await request(app).get('/graph');
    expect(after.status).toBe(200);
    expect(after.body.nodes.length).toBe(beforeCount);
  });
});