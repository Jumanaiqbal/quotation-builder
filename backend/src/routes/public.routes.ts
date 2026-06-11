import { Router } from 'express';
import {
  getQuotationByReviewToken,
  approveByReviewToken,
  rejectByReviewToken,
} from '../controllers/public.controller';

const router = Router();

router.get('/quotations/review/:token', getQuotationByReviewToken);
router.post('/quotations/review/:token/approve', approveByReviewToken);
router.post('/quotations/review/:token/reject', rejectByReviewToken);

export default router;
