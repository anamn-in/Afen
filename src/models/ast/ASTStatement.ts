import { ASTNode } from './ASTNode';
import { ASTExpression } from './ASTExpressions';

export type StatementKind = 
  | 'assignment'
  | 'function'
  | 'if'
  | 'while'
  | 'return'
  | 'expression'
  | 'block';

export interface ASTStatement extends ASTNode {
  readonly type: 'Statement';
  readonly kind: StatementKind;
  readonly body?: readonly ASTStatement[];
  readonly expression?: ASTExpression;
  readonly left?: ASTExpression;
  readonly right?: ASTExpression;
  readonly condition?: ASTExpression;
  readonly consequent?: ASTStatement[];
  readonly alternate?: ASTStatement[];
  readonly init?: ASTStatement;
  readonly test?: ASTExpression;
  readonly update?: ASTExpression;
  readonly argument?: ASTExpression;
}