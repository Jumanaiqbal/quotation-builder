import Anthropic from '@anthropic-ai/sdk';
import { env } from './env';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

export const callAI = async (
  systemPrompt: string,
  userMessage: string,
  timeoutMs = 7000,
): Promise<string> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await client.messages.create(
      {
        model: env.ANTHROPIC_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      },
      { signal: controller.signal },
    );
    return response.content[0].type === 'text' ? response.content[0].text : '';
  } finally {
    clearTimeout(timer);
  }
};
