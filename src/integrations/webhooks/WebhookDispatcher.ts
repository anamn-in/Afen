import axios from 'axios';

export interface WebhookPayload {
    eventType: string;
    fingerprint: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: number;
    details: Record<string, any>;
}

export class WebhookDispatcher {
    private webhookUrl: string | undefined;

    constructor(webhookUrl?: string) {
        this.webhookUrl = webhookUrl || process.env.WEBHOOK_URL;
    }

    async dispatch(payload: WebhookPayload): Promise<void> {
        if (!this.webhookUrl) {
            console.warn('[WebhookDispatcher] No webhook URL configured, skipping dispatch');
            return;
        }
        try {
            await axios.post(this.webhookUrl, payload, { timeout: 5000 });
            console.log(`[WebhookDispatcher] Dispatched ${payload.eventType} for ${payload.fingerprint}`);
        } catch (err) {
            console.error('[WebhookDispatcher] Failed to dispatch webhook:', err);
        }
    }
}