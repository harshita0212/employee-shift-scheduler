import { Router } from 'express';
import codeReviewController from '../controllers/code-review.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/run', codeReviewController.runReview);

export default router;
