import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';

// Workaround for Resource import

const { Resource } = require('@opentelemetry/resources') as {
  Resource: new (attrs: Record<string, string>) => unknown;
};

export class OTelExporter {
    private provider: NodeTracerProvider | null = null;

    constructor() {
        if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
            this.init();
        }
    }

    private init(): void {
        diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);
        const resourceAttrs = {
            [SEMRESATTRS_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'afen',
        };
        const resource = new Resource(resourceAttrs) as any;
        const exporter = new OTLPTraceExporter({
            url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
        });
        const processor = new SimpleSpanProcessor(exporter);

        try {
            // @ts-ignore - newer SDK accepts spanProcessors in constructor
            this.provider = new NodeTracerProvider({ resource, spanProcessors: [processor] });
        } catch {
            this.provider = new NodeTracerProvider({ resource });
            (this.provider as any).addSpanProcessor(processor);
        }
        this.provider.register();
        console.log('[OTelExporter] OpenTelemetry initialized');
    }

    getTracer(name: string = 'afen') {
        if (!this.provider) {
            console.warn('[OTelExporter] OpenTelemetry not configured, returning no-op tracer');
            return { startActiveSpan: (_name: string, fn: any) => fn({ end: () => {} }) };
        }
        return this.provider.getTracer(name);
    }
}
