import axios from 'axios';
import { env } from '../lib/env';
import { logger } from '../lib/logger';

export const fireApprovalWebhook = async (
  quotationId: string,
  payload: Record<string, unknown>,
): Promise<void> => {
  if (!env.N8N_WEBHOOK_URL) {
    logger.info('N8N_WEBHOOK_URL not configured, skipping webhook');
    return;
  }

  try {
    await axios.post(env.N8N_WEBHOOK_URL, {
      event: 'quotation.approved',
      quotationId,
      ...payload,
    });
    logger.info('n8n webhook fired successfully', { quotationId });
  } catch (err) {
    logger.error('n8n webhook failed (non-blocking)', {
      quotationId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
