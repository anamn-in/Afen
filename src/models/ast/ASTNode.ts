export interface ASTNode {
  readonly id: string;
  readonly type: string;
  readonly children: readonly ASTNode[];
  readonly location?: ASTLocation;
}

export interface ASTLocation {
  readonly file: string;
  readonly line: number;
  readonly column: number;
}