import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    InitializeParams,
    TextDocumentSyncKind,
    InitializeResult,
    TextDocumentChangeEvent,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DiagnosticEngine } from './DiagnosticEngine';

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);
const diagnosticEngine = new DiagnosticEngine();

connection.onInitialize((params: InitializeParams): InitializeResult => {
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            diagnosticProvider: { interFileDependencies: false, workspaceDiagnostics: false },
        },
    };
});

documents.onDidChangeContent((change: TextDocumentChangeEvent<TextDocument>) => {
    const diagnostics = diagnosticEngine.analyzeDocument(change.document);
    connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
});

documents.listen(connection);
connection.listen();