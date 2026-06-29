import { Token, TokenType, tokenize } from './Tokenizer';

export interface ASTNode {
  type: string;
  value?: any;
  left?: ASTNode;
  right?: ASTNode;
}

export class Parser {
  private tokens!: Token[];
  private pos!: number;

  parse(source: string): ASTNode {
    this.tokens = tokenize(source);
    this.pos = 0;
    const ast = this.parseStatement();
    if (!this.isAtEnd()) {
      throw new Error(`Unexpected token at ${this.peek().line}:${this.peek().col}`);
    }
    return ast;
  }

  private parseStatement(): ASTNode {
    if (this.peek().value === 'FIND') {
      return this.parseFind();
    }
    return this.parseSelect();
  }

  // ---------- FIND (optional WHERE) ----------
  private parseFind(): ASTNode {
    this.expect(TokenType.KEYWORD, 'FIND');
    const target = this.consumeAnyOf([TokenType.KEYWORD, TokenType.IDENTIFIER], 'Expected collection name');
    let condition: ASTNode | null = null;
    if (this.match(TokenType.KEYWORD) && this.peek().value === 'WHERE') {
      this.advance();
      condition = this.parseCondition();
    }
    return {
      type: 'find',
      value: { target: target.value, condition },
    };
  }

  // ---------- SELECT (supports FILTER, TIME, LIMIT, and pipe in any order) ----------
  private parseSelect(): ASTNode {
    this.expect(TokenType.KEYWORD, 'SELECT');
    let field: string;
    if (this.peek().type === TokenType.STAR) {
      field = '*';
      this.advance();
    } else {
      const fieldToken = this.consume(TokenType.IDENTIFIER, 'Expected field name or *');
      field = fieldToken.value;
    }
    this.expect(TokenType.KEYWORD, 'FROM');
    const target = this.consumeAnyOf([TokenType.KEYWORD, TokenType.IDENTIFIER], 'Expected target');

    let filter: ASTNode | null = null;
    let timeRange: ASTNode | null = null;
    let limit: ASTNode | null = null;
    let pipe: ASTNode | null = null;

    while (!this.isAtEnd()) {
      const tok = this.peek();
      const prevPos = this.pos; // safety guard to prevent infinite loops

      if (tok.type === TokenType.KEYWORD && tok.value === 'FILTER') {
        this.advance();
        filter = this.parseCondition();
      } else if (tok.type === TokenType.KEYWORD && tok.value === 'TIME') {
        this.advance();
        timeRange = this.parseTimeRange();
      } else if (tok.type === TokenType.KEYWORD && tok.value === 'LIMIT') {
        this.advance();
        limit = this.parseLimit();
      } else if (tok.type === TokenType.OPERATOR && tok.value === '|>') {
        this.advance();
        pipe = this.parsePipe();
        break; // pipe is terminal; nothing after it
      } else {
        break;
      }

      // If position didn't advance, break to prevent infinite loop
      if (this.pos === prevPos) break;
    }

    return {
      type: 'select',
      value: { field, target: target.value, filter, timeRange, limit, pipe },
    };
  }

  // ---------- Condition with AND/OR (EOF guard added) ----------
  private parseCondition(): ASTNode {
    let left = this.parseTerm();
    while (
      !this.isAtEnd() &&
      this.match(TokenType.KEYWORD) &&
      (this.peek().value === 'AND' || this.peek().value === 'OR')
    ) {
      const operator = this.peek().value;
      this.advance();
      const right = this.parseTerm();
      left = {
        type: 'binary',
        value: { operator },
        left,
        right,
      };
    }
    return left;
  }

  private parseTerm(): ASTNode {
    const field = this.consume(TokenType.IDENTIFIER, 'Expected field name');
    const op = this.consume(TokenType.OPERATOR, 'Expected operator (==, !=, >, <, >=, <=)');
    const value = this.consumeAnyOf(
      [TokenType.STRING_OR_NUMBER, TokenType.STRING, TokenType.IDENTIFIER],
      'Expected value (string, number, or identifier)'
    );
    return {
      type: 'filter',
      value: { field: field.value, op: op.value, val: value.value },
    };
  }

  // ---------- TIME ----------
  private parseTimeRange(): ASTNode {
    // Handle quoted string: "last 15m"
    if (this.match(TokenType.STRING)) {
      const range = this.consume(TokenType.STRING, 'Expected time range');
      return { type: 'timeRange', value: range.value };
    }
    // Bare words: last 15m (two tokens) OR last 15 m (three tokens)
    const word = this.consumeAnyOf(
      [TokenType.IDENTIFIER, TokenType.KEYWORD],
      'Expected time keyword like "last"'
    );
    const number = this.consume(TokenType.STRING_OR_NUMBER, 'Expected duration number');
    // Optional unit token (m, h, d, s) as separate IDENTIFIER
    let unit = '';
    if (!this.isAtEnd() && this.match(TokenType.IDENTIFIER)) {
      unit = this.advance_value();
    }
    return { type: 'timeRange', value: `${word.value} ${number.value}${unit}` };
  }

  // ---------- LIMIT ----------
  private parseLimit(): ASTNode {
    const num = this.consume(TokenType.STRING_OR_NUMBER, 'Expected number');
    return { type: 'limit', value: parseInt(num.value, 10) };
  }

  // ---------- Pipeline (RANK, COUNT, PREDICT, FORECAST) ----------
  private parsePipe(): ASTNode {
    const cmd = this.consume(TokenType.KEYWORD, 'Expected pipeline command (RANK|COUNT|PREDICT|FORECAST)');
    let args: any[] = [];
    if (this.match(TokenType.LPAREN)) {
      this.advance();
      while (!this.match(TokenType.RPAREN)) {
        const arg = this.consumeAnyOf(
          [TokenType.IDENTIFIER, TokenType.STRING_OR_NUMBER, TokenType.STRING],
          'Expected argument'
        );
        args.push(arg.value);
        if (this.match(TokenType.COMMA)) this.advance();
      }
      this.advance(); // consume ')'
    }
    return { type: 'aggregate', value: { cmd: cmd.value, args } };
  }

  // ---------- Helpers ----------
  private consumeAnyOf(types: TokenType[], msg: string): Token {
    if (this.isAtEnd()) throw new Error(`${msg} at end of input`);
    const tok = this.tokens[this.pos];
    if (!types.includes(tok.type)) {
      throw new Error(`${msg} at ${tok.line}:${tok.col}`);
    }
    this.pos++;
    return tok;
  }

  private consume(type: TokenType, msg: string): Token {
    return this.consumeAnyOf([type], msg);
  }

  private expect(type: TokenType, value?: string): Token {
    const tok = this.consume(type, `Expected ${type}`);
    if (value !== undefined && tok.value !== value) {
      throw new Error(`Expected '${value}' got '${tok.value}' at ${tok.line}:${tok.col}`);
    }
    return tok;
  }

  private match(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.tokens[this.pos].type === type;
  }

  // Safe peek: never returns undefined
  private peek(): Token {
    if (this.pos >= this.tokens.length) {
      return { type: TokenType.EOF, value: '', line: 0, col: 0 };
    }
    return this.tokens[this.pos];
  }

  private advance(): void {
    if (!this.isAtEnd()) this.pos++;
  }

  // Fixed isAtEnd: safe bounds check
  private isAtEnd(): boolean {
    if (this.pos >= this.tokens.length) return true;
    return this.tokens[this.pos].type === TokenType.EOF;
  }

  // Safe advance_value with bounds check
  private advance_value(): string {
    if (this.isAtEnd()) return '';
    const tok = this.tokens[this.pos];
    this.pos++;
    return tok.value;
  }
}