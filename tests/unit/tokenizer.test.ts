import { tokenize, TokenType, Token } from '@models/ast/Tokenizer';

describe('Tokenizer', () => {
  it('tokenizes SELECT * FROM trace', () => {
    const tokens = tokenize('SELECT * FROM trace');
    expect(tokens.map((t: Token) => t.type)).toEqual([
      TokenType.KEYWORD,
      TokenType.STAR,
      TokenType.KEYWORD,
      TokenType.IDENTIFIER,
      TokenType.EOF,
    ]);
    // ... rest unchanged
  });

  it('tokenizes multi‑char operators', () => {
    const tokens = tokenize('!= |> >=');
    expect(tokens.map((t: Token) => t.type)).toEqual([
      TokenType.OPERATOR, TokenType.OPERATOR, TokenType.OPERATOR, TokenType.EOF,
    ]);
    expect(tokens[0].value).toBe('!=');
    expect(tokens[1].value).toBe('|>');
    expect(tokens[2].value).toBe('>=');
  });

  // ... other tests
});