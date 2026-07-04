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

interface ExplicitMarker {
  functionName: string;
  filename: string;
  lineNumber: number;
  raw: string;
}

export class FrameClassifier {
  static classifyFrame(frame: StackFrame): ClassifiedFrame {
    const isAppOwned = FrameClassifier.isAppOwnedFrame(frame);
    const isExplicitMarker = FrameClassifier.isExplicitMarkerFrame(frame);
    return { frame, isAppOwned, isExplicitMarker };
  }

  static classifyStack(stackFrames: StackFrame[], rawStackLines: string[] = []): ClassificationResult {
    if ((!stackFrames || stackFrames.length === 0) && rawStackLines.length === 0) {
      return { confidence: 0.1, evidence: ['no stack frames available'], primaryFrame: null };
    }

    const explicitFromRaw = FrameClassifier.findExplicitMarkerInRawStack(rawStackLines);
    if (explicitFromRaw) {
      return {
        confidence: 0.9,
        evidence: [`explicit root-cause marker: ${explicitFromRaw.raw}`],
        primaryFrame: {
          functionName: explicitFromRaw.functionName,
          filename: explicitFromRaw.filename,
          lineNumber: explicitFromRaw.lineNumber,
          columnNumber: 0,
        } as StackFrame,
      };
    }

    const classified = stackFrames.map((frame) => FrameClassifier.classifyFrame(frame));

    const markerFrame = classified.find((item) => item.isExplicitMarker && item.isAppOwned);
    if (markerFrame) {
      return {
        confidence: 0.9,
        evidence: [
          `explicit root-cause marker: ${markerFrame.frame.functionName || 'unknown'} @ ${markerFrame.frame.filename || 'unknown'}:${markerFrame.frame.lineNumber || '?'}`,
        ],
        primaryFrame: markerFrame.frame,
      };
    }

    const appFrames = classified.filter((item) => item.isAppOwned);
    if (appFrames.length > 0) {
      const primary = appFrames[0].frame;
      return {
        confidence: 0.7,
        evidence: [
          `app-owned source frame: ${primary.filename || 'unknown'} (${primary.functionName || 'anonymous'}:${primary.lineNumber || '?'})`,
        ],
        primaryFrame: primary,
      };
    }

    return {
      confidence: 0.1,
      evidence: ['no direct causes found; root cause may be the error itself'],
      primaryFrame: stackFrames[0] || null,
    };
  }

  private static findExplicitMarkerInRawStack(rawStackLines: string[]): ExplicitMarker | null {
    for (const rawLine of rawStackLines) {
      const line = String(rawLine || '').trim();
      const match = line.match(
        /^([A-Za-z_$][\w$.-]*)\s*@\s*(.+?\.(?:tsx|ts|jsx|js|py|java|go|rs|rb|cs|c|cpp|cc|cxx|h|hpp|sql)):(\d+)(?::\d+)?$/
      );

      if (!match) continue;

      const marker = {
        functionName: match[1],
        filename: match[2],
        lineNumber: Number(match[3]),
        raw: line,
      };

      if (FrameClassifier.isAppOwnedPath(marker.filename)) {
        return marker;
      }
    }

    return null;
  }

  private static isAppOwnedFrame(frame: StackFrame): boolean {
    return FrameClassifier.isAppOwnedPath(frame.filename || '');
  }

  private static isAppOwnedPath(file: string): boolean {
    const lower = file.toLowerCase();

    const frameworkPatterns = [
      'node_modules',
      'react-dom',
      'next/dist',
      'webpack/bootstrap',
      'site-packages',
      'dist-packages',
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

    const appSignals = ['/src/', 'webpack:///src/', '\\src\\', '/app/src/'];
    for (const signal of appSignals) {
      if (lower.includes(signal)) return true;
    }

    const extensions = [
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.py',
      '.java',
      '.go',
      '.rs',
      '.rb',
      '.cs',
      '.c',
      '.cpp',
      '.cc',
      '.cxx',
      '.h',
      '.hpp',
      '.sql',
    ];

    return extensions.some((ext) => lower.endsWith(ext));
  }

  private static isExplicitMarkerFrame(frame: StackFrame): boolean {
    const func = frame.functionName || '';
    const file = frame.filename || '';

    const knownExplicitFunctions = [
      'mapRows',
      'normalize_rows',
      'normalizeRows',
      'parseRows',
      'transformRows',
      'hydrateRows',
      'loadRows',
    ];

    return knownExplicitFunctions.some((marker) => func.includes(marker)) && FrameClassifier.isAppOwnedPath(file);
  }
}