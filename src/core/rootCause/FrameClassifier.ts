import { StackFrame } from '@models/uir/UIREvent';

export interface ClassifiedFrame {
  frame: StackFrame;
  isAppOwned: boolean;
  isExplicitMarker: boolean;
}

export interface ClassificationResult {
  confidence: number;
  evidence: string[];
  primaryFrame: StackFrame | null;
}

export class FrameClassifier {
  static classifyFrame(frame: StackFrame): ClassifiedFrame {
    const isAppOwned = FrameClassifier.isAppOwnedFrame(frame);
    const isExplicitMarker = FrameClassifier.isExplicitMarkerFrame(frame);
    return { frame, isAppOwned, isExplicitMarker };
  }

  static classifyStack(stackFrames: StackFrame[]): ClassificationResult {
    if (!stackFrames || stackFrames.length === 0) {
      return { confidence: 0.1, evidence: ['no stack frames available'], primaryFrame: null };
    }

    const classified = stackFrames.map(f => FrameClassifier.classifyFrame(f));

    // 1. Explicit marker – only if the frame is app‑owned
    // This ensures we don't pick framework frames like "renderWithHooks"
    const markerFrame = classified.find(c => c.isExplicitMarker && c.isAppOwned);
    if (markerFrame) {
      return {
        confidence: 0.9,
        evidence: [`explicit root‑cause marker: ${markerFrame.frame.functionName || 'unknown'} @ ${markerFrame.frame.filename || 'unknown'}:${markerFrame.frame.lineNumber || '?'}`],
        primaryFrame: markerFrame.frame,
      };
    }

    // 2. App‑owned frames (prefer the innermost)
    const appFrames = classified.filter(c => c.isAppOwned);
    if (appFrames.length > 0) {
      const primary = appFrames[0].frame;
      return {
        confidence: 0.7,
        evidence: [`app‑owned source frame: ${primary.filename || 'unknown'} (${primary.functionName || 'anonymous'}:${primary.lineNumber || '?'})`],
        primaryFrame: primary,
      };
    }

    // 3. Fallback – use the innermost frame even if vendor
    const innermost = stackFrames[0];
    return {
      confidence: 0.1,
      evidence: ['no direct causes found; root cause may be the error itself'],
      primaryFrame: innermost,
    };
  }

  private static isAppOwnedFrame(frame: StackFrame): boolean {
    const file = frame.filename || '';
    const lower = file.toLowerCase();

    // Framework/internal patterns
    const frameworkPatterns = [
      'node_modules',
      'react-dom',
      'next/dist',
      'webpack/bootstrap',
      'express',
      'layer',
      'router',
      'koa',
      'fastify',
      'runtime',
      'node:',
      'internal/',
      'webpack:///webpack/',
    ];
    for (const pattern of frameworkPatterns) {
      if (lower.includes(pattern)) return false;
    }

    // App‑owned signals
    const appSignals = ['/src/', 'webpack:///src/', '\\src\\'];
    for (const signal of appSignals) {
      if (lower.includes(signal)) return true;
    }

    // If file ends with .tsx, .ts, .jsx, .js and not in node_modules, assume app
    const extensions = ['.tsx', '.ts', '.jsx', '.js'];
    for (const ext of extensions) {
      if (file.endsWith(ext)) return true;
    }

    return false;
  }

  private static isExplicitMarkerFrame(frame: StackFrame): boolean {
    // Heuristics: function name contains known marker patterns or filename matches
    const func = frame.functionName || '';
    const file = frame.filename || '';

    // Known explicit marker function names (add more as needed)
    const explicitMarkers = ['mapRows', 'render', 'handle', 'onClick', 'useEffect', 'componentDidMount'];
    for (const marker of explicitMarkers) {
      if (func.includes(marker)) return true;
    }
    // Also check filename for specific app files that often contain markers
    if (file.includes('DataTable.tsx')) return true;
    return false;
  }
}