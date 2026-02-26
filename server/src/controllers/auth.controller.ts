import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, role } = req.body;
            const result = await authService.register(email, password, role);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.json(result);
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async getProfile(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const profile = await authService.getProfile(userId);
            res.json(profile);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }
}

export default new AuthController();
