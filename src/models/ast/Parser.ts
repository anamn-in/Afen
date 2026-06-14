import { Token, TokenType, tokenize } from './Tokenizer';

export interface ASTNode {
  type: 'select' | 'pipe' | 'filter' | 'timeRange' | 'aggregate' | 'predict';
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
    const ast = this.parseSelect();
    if (!this.isAtEnd()) throw new Error(`Unexpected token at ${this.peek().line}:${this.peek().col}`);
    return ast;
  }

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
    const target = this.consume(TokenType.IDENTIFIER, 'Expected target').value;
    let filter: ASTNode | undefined;
    if (this.match(TokenType.KEYWORD) && this.peek().value === 'FILTER') {
      this.advance();
      filter = this.parseFilter();
    }
    let timeRange: ASTNode | undefined;
    if (this.match(TokenType.KEYWORD) && this.peek().value === 'TIME') {
      this.advance();
      timeRange = this.parseTimeRange();
    }
    let pipe: ASTNode | undefined;
    if (this.match(TokenType.OPERATOR) && this.peek().value === '|>') {
      this.advance();
      pipe = this.parsePipe();
    }
    return {
      type: 'select',
      value: { field, target },
      left: filter,
      right: pipe,
    };
  }

  private parseFilter(): ASTNode {
    const condition = this.consume(TokenType.IDENTIFIER, 'Expected condition field');
    const op = this.consume(TokenType.OPERATOR, 'Expected operator (==, !=, >, <)');
    const value = this.consume(TokenType.STRING_OR_NUMBER, 'Expected value');
    return { type: 'filter', value: { field: condition.value, op: op.value, val: value.value } };
  }

  private parseTimeRange(): ASTNode {
    const range = this.consume(TokenType.STRING, 'Expected time range like "last 15m"');
    return { type: 'timeRange', value: range.value };
  }

  private parsePipe(): ASTNode {
    // FIXED: Changed from IDENTIFIER to KEYWORD because pipeline commands are keywords
    const cmd = this.consume(TokenType.KEYWORD, 'Expected pipeline command (RANK|COUNT|PREDICT)');
    let args: any[] = [];
    if (this.match(TokenType.LPAREN)) {
      this.advance();
      while (!this.match(TokenType.RPAREN)) {
        args.push(this.consume(TokenType.STRING_OR_NUMBER, 'Expected argument').value);
        if (this.match(TokenType.COMMA)) this.advance();
      }
      this.advance();
    }
    return { type: 'aggregate', value: { cmd: cmd.value, args } };
  }

  private consume(type: TokenType, msg: string): Token {
    if (this.isAtEnd()) throw new Error(msg);
    const tok = this.tokens[this.pos];
    if (tok.type !== type) throw new Error(`${msg} at ${tok.line}:${tok.col}`);
    this.pos++;
    return tok;
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

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private advance(): void {
    if (!this.isAtEnd()) this.pos++;
  }

  private isAtEnd(): boolean {
    return this.pos >= this.tokens.length || this.tokens[this.pos].type === TokenType.EOF;
  }
}