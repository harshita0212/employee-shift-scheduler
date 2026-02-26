import { Request, Response } from 'express';
import availabilityService from '../services/availability.service';

export class AvailabilityController {
    async getAll(_req: Request, res: Response): Promise<void> {
        try {
            const availabilities = await availabilityService.getAll();
            res.json(availabilities);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getByEmployee(req: Request, res: Response): Promise<void> {
        try {
            const availabilities = await availabilityService.getByEmployee(req.params.employeeId as string);
            res.json(availabilities);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async set(req: Request, res: Response): Promise<void> {
        try {
            const { employeeId, availabilities } = req.body;
            const result = await availabilityService.set(employeeId, availabilities);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const result = await availabilityService.delete(req.params.id as string);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new AvailabilityController();
