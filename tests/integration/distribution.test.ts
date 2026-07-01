import { describe, it, expect } from '@jest/globals';
import { AfenClient as JsClient } from '../../packages/sdk-js/src/Client';
import { DiagnosticEngine } from '../../src/integrations/lsp/DiagnosticEngine';
import { TextDocument } from 'vscode-languageserver-textdocument';

describe('SDK distribution', () => {
  it('JS client can be instantiated', () => {
    const client = new JsClient({ apiUrl: 'http://127.0.0.1:8787', apiKey: 'test', serviceName: 'test' });
    expect(client).toBeDefined();
  });

  it('DiagnosticEngine returns diagnostics for a file', () => {
    const engine = new DiagnosticEngine();
    const doc = TextDocument.create('file:///test.ts', 'typescript', 1, '// TODO fix this\nconst x = 1;');
    const diags = engine.analyzeDocument(doc);
    expect(diags.length).toBeGreaterThan(0);
    expect(diags[0].message).toContain('TODO');
  });
});

