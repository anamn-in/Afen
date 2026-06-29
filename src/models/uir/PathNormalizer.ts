export class PathNormalizer {
  private static readonly REPO_ROOT = '<repo-root>';
  private static readonly VOLATILE_PATTERNS = [
    /\/Users\/[^\/]+\//gi,
    /\/home\/[^\/]+\//gi,
    /\/workspace\/[^\/]+\//gi,
    /\/tmp\/[^\/]+\//gi,
  ];

  /**
   * Normalizes an absolute file path into a repository-relative path.
   * Handles both Windows (backslash) and Unix (forward slash) separators,
   * and collapses double backslashes into single forward slashes.
   */
  static normalize(absolutePath: string): string {
    let normalized = absolutePath;

    // 1. Normalize all backslashes (single or double) to forward slashes
    // This handles both C:\\Users and C:\Users uniformly.
    normalized = normalized.replace(/\\+/g, '/');

    // 2. Remove Windows drive letters (e.g., "C:/" -> "/")
    normalized = normalized.replace(/^[A-Za-z]:\//, '/');

    // 3. Replace common volatile patterns with <repo-root>
    for (const pattern of this.VOLATILE_PATTERNS) {
      normalized = normalized.replace(pattern, this.REPO_ROOT + '/');
    }

    // 4. Remove any leading "../" or "./" artifacts
    normalized = normalized.replace(/^(\.\.\/)+/, '');
    normalized = normalized.replace(/^\.\//, '');

    return normalized;
  }
}