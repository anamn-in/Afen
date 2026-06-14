import { TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';

export class DiagnosticEngine {
    analyzeDocument(doc: TextDocument): Diagnostic[] {
        const diagnostics: Diagnostic[] = [];
        const text = doc.getText();
        const lines = text.split('\n');
        lines.forEach((line: string, idx: number) => {
            if (line.includes('TODO') || line.includes('FIXME')) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: { line: idx, character: 0 },
                        end: { line: idx, character: line.length },
                    },
                    message: line.includes('TODO') ? 'TODO: Fix this' : 'Potential tech debt detected – Afen suggests review',
                    source: 'afen',
                });
            }
        });
        return diagnostics;
    }
}