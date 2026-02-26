import { Request, Response } from 'express';
import leaveService from '../services/leave.service';
import { AuthRequest } from '../middleware/auth';

export class LeaveController {
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const filters = {
                employeeId: req.query.employeeId as string | undefined,
                status: req.query.status as string | undefined,
            };
            const leaves = await leaveService.getAll(filters);
            res.json(leaves);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const leave = await leaveService.getById(req.params.id as string);
            res.json(leave);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async create(req: AuthRequest, res: Response): Promise<void> {
        try {
            const leave = await leaveService.create(req.body);
            res.status(201).json(leave);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateStatus(req: Request, res: Response): Promise<void> {
        try {
            const { status } = req.body;
            const leave = await leaveService.updateStatus(req.params.id as string, status);
            res.json(leave);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const result = await leaveService.delete(req.params.id as string);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new LeaveController();
