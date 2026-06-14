export class UIRContext {
  constructor(
    public readonly language: string = 'unknown',
    public readonly environment: string = process.env.NODE_ENV || 'production',
    public readonly serviceName: string = process.env.SERVICE_NAME || 'afen',
    public readonly version: string = process.env.DEPLOYMENT_VERSION || '1.0.0'
  ) {}
}