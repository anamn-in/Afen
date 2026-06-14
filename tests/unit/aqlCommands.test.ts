import { Parser } from '@models/ast/Parser';

describe('AQL parser', () => {
  const parser = new Parser();

  it('parses SELECT * FROM trace', () => {
    const ast = parser.parse('SELECT * FROM trace');
    expect(ast.type).toBe('select');
    expect(ast.value.field).toBe('*');
    expect(ast.value.target).toBe('trace');
  });

  it('parses SELECT field FROM cause', () => {
    const ast = parser.parse('SELECT nodeId FROM cause');
    expect(ast.type).toBe('select');
    expect(ast.value.field).toBe('nodeId');
    expect(ast.value.target).toBe('cause');
  });
});