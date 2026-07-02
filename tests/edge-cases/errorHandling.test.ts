import { app } from '../../src/api/Server';
import { Parser } from '../../src/models/ast/Parser';

describe('Error handling', () => {
  const parser = new Parser();

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('throws on empty query', () => {
    expect(() => parser.parse('')).toThrow();
  });

  it('returns 400 for missing query field', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/query',
      payload: {},
    });

    expect(res.statusCode).toBe(400);
  });
});