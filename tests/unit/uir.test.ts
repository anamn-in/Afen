import { UIRPipeline } from '@models/uir/UIRPipeline';
import { generateMockPayload } from '../helpers/mockPayloads';

describe('UIR normalization', () => {
  const pipeline = new UIRPipeline();

  it('normalizes JavaScript error', async () => {
    const payload = generateMockPayload('javascript', 'test');
    const uir = await pipeline.processRawPayload(payload);
    expect(uir.sourceLanguage).toBe('javascript');
    expect(uir.normalizedStack.length).toBeGreaterThan(0);
    expect(uir.otelAttributes['exception.type']).toBe('JavascriptError');
  });

  it('normalizes Python error', async () => {
    const payload = generateMockPayload('python', 'test');
    const uir = await pipeline.processRawPayload(payload);
    expect(uir.sourceLanguage).toBe('python');
    expect(uir.normalizedStack.length).toBeGreaterThan(0);
  });

  it('normalizes Go error', async () => {
    const payload = generateMockPayload('go', 'test');
    const uir = await pipeline.processRawPayload(payload);
    expect(uir.sourceLanguage).toBe('go');
    expect(uir.normalizedStack.length).toBeGreaterThan(0);
  });
});