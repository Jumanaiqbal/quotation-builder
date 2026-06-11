import { Router } from 'express';
import {
  getQuotationByReviewToken,
  getQuotationPdfByReviewToken,
  approveByReviewToken,
  rejectByReviewToken,
} from '../controllers/public.controller';

const router = Router();

router.get('/quotations/review/:token', getQuotationByReviewToken);
router.get('/quotations/review/:token/pdf', getQuotationPdfByReviewToken);
router.post('/quotations/review/:token/approve', approveByReviewToken);
router.post('/quotations/review/:token/reject', rejectByReviewToken);

export default router;
