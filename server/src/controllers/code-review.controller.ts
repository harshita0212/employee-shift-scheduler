import { Request, Response } from 'express';
import { codeReviewService } from '../services/code-review.service';

export class CodeReviewController {
    async runReview(_req: Request, res: Response): Promise<void> {
        try {
            const results = codeReviewService.runFullReview();
            res.json(results);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new CodeReviewController();
