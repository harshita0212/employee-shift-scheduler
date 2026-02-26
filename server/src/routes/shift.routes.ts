import { Router } from 'express';
import shiftController from '../controllers/shift.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', shiftController.getAll);
router.get('/:id', shiftController.getById);
router.post('/', authorize('ADMIN', 'MANAGER'), shiftController.create);
router.put('/:id', authorize('ADMIN', 'MANAGER'), shiftController.update);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), shiftController.delete);

export default router;
