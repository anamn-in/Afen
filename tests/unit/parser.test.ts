import { Parser } from '../../src/models/ast/Parser';

describe('Parser', () => {
  const parser = new Parser();

  it('parses SELECT * FROM errors', () => {
    const ast = parser.parse('SELECT * FROM errors');

    expect(ast.type).toBe('select');
    expect(ast.value).toEqual({
      field: '*',
      target: 'errors',
      filter: null,
      timeRange: null,
      limit: null,
      pipe: null,
    });
  });

  it('parses SELECT field FROM errors', () => {
    const ast = parser.parse('SELECT message FROM errors');

    expect(ast.type).toBe('select');
    expect(ast.value.field).toBe('message');
    expect(ast.value.target).toBe('errors');
  });

  it('parses with FILTER clause', () => {
    const ast = parser.parse('SELECT * FROM errors FILTER severity == 5');

    expect(ast.value.filter).toBeDefined();
    expect(ast.value.filter.type).toBe('filter');
    expect(ast.value.filter.value).toEqual({ field: 'severity', op: '==', val: '5' });
  });

  it('parses with TIME clause', () => {
    const ast = parser.parse('SELECT * FROM errors TIME last 15m');

    expect(ast.value.timeRange).toEqual({
      type: 'timeRange',
      value: 'last 15m',
    });
  });

  it('parses with pipe operator RANK', () => {
    const ast = parser.parse('SELECT * FROM errors |> RANK(severity, count)');

    expect(ast.value.pipe).toBeDefined();
    expect(ast.value.pipe.type).toBe('aggregate');
    expect(ast.value.pipe.value.cmd).toBe('RANK');
    expect(ast.value.pipe.value.args).toEqual(['severity', 'count']);
  });

  it('parses pipe COUNT', () => {
    const ast = parser.parse('SELECT * FROM errors |> COUNT');

    expect(ast.value.pipe.value.cmd).toBe('COUNT');
    expect(ast.value.pipe.value.args).toEqual([]);
  });

  it('throws on unexpected token at end', () => {
    expect(() => parser.parse('SELECT * FROM errors EXTRA')).toThrow();
  });

  it('throws when missing FROM', () => {
    expect(() => parser.parse('SELECT field errors')).toThrow();
  });

  it('throws when missing field', () => {
    expect(() => parser.parse('SELECT FROM errors')).toThrow();
  });
});