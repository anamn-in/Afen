export enum TokenType {
  KEYWORD,
  IDENTIFIER,
  OPERATOR,
  STRING_OR_NUMBER,
  STRING,
  LPAREN,
  RPAREN,
  COMMA,
  STAR,
  EOF,
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  col: number;
}

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let line = 1;
  let col = 1;
  let i = 0;

  const keywords = new Set([
    'SELECT',
    'FROM',
    'FILTER',
    'TIME',
    'RANK',
    'COUNT',
    'FIND',
    'WHERE',
    'ERRORS',
    'LIMIT',
    'AND',
    'OR',
  ]);

  const operators = new Set(['=', '==', '!=', '>', '<', '>=', '<=', '|>']);

  while (i < source.length) {
    const ch = source[i];

    if (ch === ' ' || ch === '\t' || ch === ';') {
      i++;
      col++;
      continue;
    }

    if (ch === '\n' || ch === '\r') {
      line++;
      col = 1;
      i++;
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: TokenType.LPAREN, value: '(', line, col });
      i++;
      col++;
      continue;
    }

    if (ch === ')') {
      tokens.push({ type: TokenType.RPAREN, value: ')', line, col });
      i++;
      col++;
      continue;
    }

    if (ch === ',') {
      tokens.push({ type: TokenType.COMMA, value: ',', line, col });
      i++;
      col++;
      continue;
    }

    if (ch === '*') {
      tokens.push({ type: TokenType.STAR, value: '*', line, col });
      i++;
      col++;
      continue;
    }

    if (ch === '"' || ch === "'") {
      const startCol = col;
      let str = '';

      i++;
      col++;

      while (i < source.length && source[i] !== ch) {
        str += source[i];
        i++;
        col++;
      }

      if (i < source.length) {
        i++;
        col++;
      }

      tokens.push({ type: TokenType.STRING, value: str, line, col: startCol });
      continue;
    }

    if (/[0-9]/.test(ch)) {
      let num = '';
      const startCol = col;

      while (i < source.length && /[0-9]/.test(source[i])) {
        num += source[i];
        i++;
        col++;
      }

      tokens.push({ type: TokenType.STRING_OR_NUMBER, value: num, line, col: startCol });
      continue;
    }

    if (/[a-zA-Z_]/.test(ch)) {
      let ident = '';
      const startCol = col;

      while (i < source.length && /[a-zA-Z0-9_]/.test(source[i])) {
        ident += source[i];
        i++;
        col++;
      }

      const type = keywords.has(ident) ? TokenType.KEYWORD : TokenType.IDENTIFIER;
      tokens.push({ type, value: ident, line, col: startCol });
      continue;
    }

    const twoChar = source[i] + (source[i + 1] ?? '');
    if (operators.has(twoChar)) {
      tokens.push({ type: TokenType.OPERATOR, value: twoChar, line, col });
      i += 2;
      col += 2;
      continue;
    }

    if (operators.has(ch)) {
      tokens.push({ type: TokenType.OPERATOR, value: ch, line, col });
      i++;
      col++;
      continue;
    }

    throw new Error(`Unexpected character '${ch}' at ${line}:${col}`);
  }

  tokens.push({ type: TokenType.EOF, value: '', line, col });
  return tokens;
}