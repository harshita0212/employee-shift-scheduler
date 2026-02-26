import { Request, Response } from 'express';
import dashboardService from '../services/dashboard.service';

export class DashboardController {
    async getStats(_req: Request, res: Response): Promise<void> {
        try {
            const stats = await dashboardService.getStats();
            res.json(stats);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new DashboardController();
