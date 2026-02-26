import { Router } from 'express';
import leaveController from '../controllers/leave.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', leaveController.getAll);
router.get('/:id', leaveController.getById);
router.post('/', leaveController.create);
router.patch('/:id/status', authorize('ADMIN', 'MANAGER'), leaveController.updateStatus);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), leaveController.delete);

export default router;
