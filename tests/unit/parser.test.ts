import { Parser } from '@models/ast/Parser';

describe('Parser', () => {
  const parser = new Parser();

  it('parses SELECT * FROM trace', () => {
    const ast = parser.parse('SELECT * FROM trace');
    expect(ast.type).toBe('select');
    expect(ast.value).toEqual({ field: '*', target: 'trace' });
  });

  it('parses SELECT field FROM cause', () => {
    const ast = parser.parse('SELECT field FROM cause');
    expect(ast.value.field).toBe('field');
    expect(ast.value.target).toBe('cause');
  });

  it('parses with FILTER clause using single =', () => {
    const ast = parser.parse('SELECT * FROM trace FILTER level = 5');
    expect(ast.left).toBeDefined();
    expect(ast.left!.type).toBe('filter');
    expect(ast.left!.value).toEqual({ field: 'level', op: '=', val: '5' });
  });

  it('parses with TIME clause (no structural assertion, just no error)', () => {
    const ast = parser.parse('SELECT * FROM trace TIME "last 15m"');
    expect(ast.type).toBe('select');
  });

  it('parses with pipe operator RANK', () => {
    const ast = parser.parse('SELECT * FROM trace |> RANK()');
    expect(ast.right).toBeDefined();
    expect(ast.right!.type).toBe('aggregate');
    expect(ast.right!.value.cmd).toBe('RANK');
  });

  it('parses pipe with argument', () => {
    const ast = parser.parse('SELECT * FROM trace |> COUNT(10)');
    expect(ast.right!.value.cmd).toBe('COUNT');
    expect(ast.right!.value.args).toEqual(['10']);
  });

  it('throws on unexpected token at end', () => {
    expect(() => parser.parse('SELECT * FROM trace EXTRA')).toThrow();
  });

  it('throws when missing FROM', () => {
    expect(() => parser.parse('SELECT *')).toThrow();
  });

  it('throws when missing field', () => {
    expect(() => parser.parse('SELECT FROM trace')).toThrow();
  });
});