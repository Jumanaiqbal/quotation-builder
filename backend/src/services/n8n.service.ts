import axios from 'axios';
import { env } from '../lib/env';
import { logger } from '../lib/logger';

/**
 * Spec requirement: fire n8n webhook only when quotation status becomes Approved.
 * Send/reject email flows are handled in-app for the demo; see APPROACH.md for production plan.
 */
export const fireApprovalWebhook = async (
  quotationId: string,
  payload: Record<string, unknown>,
): Promise<void> => {
  if (!env.N8N_WEBHOOK_URL) {
    logger.info('N8N_WEBHOOK_URL not configured, skipping webhook');
    return;
  }

  try {
    await axios.post(
      env.N8N_WEBHOOK_URL,
      { event: 'quotation.approved', quotationId, ...payload },
      { timeout: 15000 },
    );
    logger.info('n8n approval webhook fired', { quotationId });
  } catch (err) {
    logger.error('n8n webhook failed (non-blocking)', {
      quotationId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
