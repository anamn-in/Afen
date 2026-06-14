import { ASTNode } from './ASTNode';

export type BinaryOperator = '+' | '-' | '*' | '/' | '==' | '!=' | '<' | '>' | '<=' | '>=' | '&&' | '||';
export type UnaryOperator = '!' | '-' | '+';

export interface ASTExpression extends ASTNode {
  readonly type: 'Expression';
  readonly expressionType: 'literal' | 'binary' | 'unary' | 'identifier' | 'call';
  readonly value?: string | number | boolean | null;
  readonly operator?: BinaryOperator | UnaryOperator;
  readonly left?: ASTExpression;
  readonly right?: ASTExpression;
  readonly operand?: ASTExpression;
  readonly name?: string;
  readonly arguments?: readonly ASTExpression[];
}