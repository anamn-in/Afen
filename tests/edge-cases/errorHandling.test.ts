import request from 'supertest';
import { app } from '@api/Server';
import { Parser } from '@models/ast/Parser';

describe('Error handling', () => {
  const parser = new Parser();

  it('throws on empty query', () => {
    expect(() => parser.parse('')).toThrow();
  });

  it('returns 400 for missing query field', async () => {
    const res = await request(app).post('/query').send({});
    expect(res.status).toBe(400);
  });
});