export class PathNormalizer {
  private static readonly REPO_ROOT = '<repo-root>';
  private static readonly VOLATILE_PATTERNS = [
    /\\Users\\[^\\]+\\/gi,
    /\\home\\[^\\]+\\/gi,
    /\/Users\/[^\/]+\//gi,
    /\/home\/[^\/]+\//gi,
    /C:\\Users\\[^\\]+\\/gi,
    /\/workspace\/[^\/]+\//gi,
  ];

  static normalize(absolutePath: string): string {
    let normalized = absolutePath;
    for (const pattern of this.VOLATILE_PATTERNS) {
      normalized = normalized.replace(pattern, this.REPO_ROOT + '/');
    }
    normalized = normalized.replace(/^[A-Za-z]:\\/, '/');
    return normalized;
  }
}