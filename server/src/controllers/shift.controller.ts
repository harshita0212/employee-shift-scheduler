import { Request, Response } from 'express';
import shiftService from '../services/shift.service';

export class ShiftController {
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const filters = {
                employeeId: req.query.employeeId as string | undefined,
                startDate: req.query.startDate as string | undefined,
                endDate: req.query.endDate as string | undefined,
                status: req.query.status as string | undefined,
            };
            const shifts = await shiftService.getAll(filters);
            res.json(shifts);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const shift = await shiftService.getById(req.params.id as string);
            res.json(shift);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const shift = await shiftService.create(req.body);
            res.status(201).json(shift);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const shift = await shiftService.update(req.params.id as string, req.body);
            res.json(shift);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const result = await shiftService.delete(req.params.id as string);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new ShiftController();
