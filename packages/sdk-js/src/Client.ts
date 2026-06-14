export interface AfenConfig {
    apiUrl: string;
    apiKey: string;
    serviceName: string;
}

export class AfenClient {
    private config: AfenConfig;

    constructor(config: AfenConfig) {
        this.config = config;
        this.setupGlobalHandlers();
    }

    private setupGlobalHandlers(): void {
        process.on('uncaughtException', (error) => {
            this.reportError(error);
        });
        process.on('unhandledRejection', (reason) => {
            this.reportError(reason);
        });
    }

    private async reportError(error: any): Promise<void> {
        const payload = {
            message: error.message || String(error),
            errorType: error.name || 'Error',
            stackTraceRaw: error.stack?.split('\n') || [],
            environment: process.env,
            processInfo: { pid: process.pid, cwd: process.cwd() },
            language: 'javascript',
            timestamp: Date.now(),
        };
        try {
            await fetch(`${this.config.apiUrl}/ingest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.config.apiKey}`,
                },
                body: JSON.stringify(payload),
            });
        } catch (err) {
            // Silently fail – do not crash host app
        }
    }
}