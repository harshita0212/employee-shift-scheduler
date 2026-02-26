import { Router } from 'express';
import availabilityController from '../controllers/availability.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', availabilityController.getAll);
router.get('/employee/:employeeId', availabilityController.getByEmployee);
router.post('/', availabilityController.set);
router.delete('/:id', availabilityController.delete);

export default router;
