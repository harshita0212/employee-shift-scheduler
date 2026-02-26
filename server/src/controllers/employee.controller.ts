import { Request, Response } from 'express';
import employeeService from '../services/employee.service';

export class EmployeeController {
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string | undefined;
            const result = await employeeService.getAll(page, limit, search);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const employee = await employeeService.getById(req.params.id as string);
            res.json(employee);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const employee = await employeeService.create(req.body);
            res.status(201).json(employee);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const employee = await employeeService.update(req.params.id as string, req.body);
            res.json(employee);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const result = await employeeService.delete(req.params.id as string);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new EmployeeController();
