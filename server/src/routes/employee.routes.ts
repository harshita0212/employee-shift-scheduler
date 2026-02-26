import { Router } from 'express';
import employeeController from '../controllers/employee.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', employeeController.getAll);
router.get('/:id', employeeController.getById);
router.post('/', authorize('ADMIN', 'MANAGER'), employeeController.create);
router.put('/:id', authorize('ADMIN', 'MANAGER'), employeeController.update);
router.delete('/:id', authorize('ADMIN'), employeeController.delete);

export default router;
