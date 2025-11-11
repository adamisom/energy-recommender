import Anthropic from '@anthropic-ai/sdk';

// Validate that API key exists and is server-side only
if (typeof window !== 'undefined') {
  throw new Error('Anthropic client should only be used server-side');
}

// Lazy initialization of Anthropic client
let anthropicInstance: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!anthropicInstance) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    anthropicInstance = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicInstance;
}

// For backwards compatibility
export const anthropic = new Proxy({} as Anthropic, {
  get(_target, prop) {
    return getAnthropicClient()[prop as keyof Anthropic];
  }
});

// Export model constant
export const MODEL_NAME = 'claude-3-5-sonnet-20241022';

