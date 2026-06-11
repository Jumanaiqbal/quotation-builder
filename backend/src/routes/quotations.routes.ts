import { Router } from 'express';
import {
  listQuotations,
  createQuotation,
  getQuotation,
  updateQuotation,
  deleteQuotation,
  getQuotationPreview,
  getQuotationPdf,
  sendQuotation,
  approveQuotation,
} from '../controllers/quotations.controller';
import { createItem, updateItem, deleteItem } from '../controllers/items.controller';
import { getAiDraft } from '../controllers/ai.controller';

const router = Router();

router.post('/ai-draft', getAiDraft);

router.get('/', listQuotations);
router.post('/', createQuotation);
router.get('/:id/preview', getQuotationPreview);
router.get('/:id/pdf', getQuotationPdf);
router.post('/:id/send', sendQuotation);
router.get('/:id', getQuotation);
router.put('/:id', updateQuotation);
router.delete('/:id', deleteQuotation);

router.post('/:id/approve', approveQuotation);

router.post('/:id/items', createItem);
router.put('/:id/items/:itemId', updateItem);
router.delete('/:id/items/:itemId', deleteItem);

export default router;
