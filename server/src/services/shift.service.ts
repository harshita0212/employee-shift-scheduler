import prisma from '../config/database';

export class ShiftService {
    async getAll(filters?: {
        employeeId?: string;
        startDate?: string;
        endDate?: string;
        status?: string;
    }) {
        const where: any = {};

        if (filters?.employeeId) where.employeeId = filters.employeeId;
        if (filters?.status) where.status = filters.status;
        if (filters?.startDate || filters?.endDate) {
            where.startTime = {};
            if (filters?.startDate) where.startTime.gte = new Date(filters.startDate);
            if (filters?.endDate) where.startTime.lte = new Date(filters.endDate);
        }

        return prisma.shift.findMany({
            where,
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, department: true },
                },
            },
            orderBy: { startTime: 'asc' },
        });
    }

    async getById(id: string) {
        const shift = await prisma.shift.findUnique({
            where: { id },
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, department: true },
                },
            },
        });

        if (!shift) throw new Error('Shift not found');
        return shift;
    }

    async create(data: {
        title: string;
        startTime: string;
        endTime: string;
        employeeId: string;
        notes?: string;
    }) {
        // Check for conflicts
        const conflict = await this.checkConflict(
            data.employeeId,
            new Date(data.startTime),
            new Date(data.endTime)
        );

        if (conflict) {
            throw new Error(
                `Shift conflict: Employee already has a shift "${conflict.title}" from ${conflict.startTime.toISOString()} to ${conflict.endTime.toISOString()}`
            );
        }

        return prisma.shift.create({
            data: {
                title: data.title,
                startTime: new Date(data.startTime),
                endTime: new Date(data.endTime),
                employeeId: data.employeeId,
                notes: data.notes,
            },
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, department: true },
                },
            },
        });
    }

    async update(id: string, data: {
        title?: string;
        startTime?: string;
        endTime?: string;
        employeeId?: string;
        status?: string;
        notes?: string;
    }) {
        const existing = await prisma.shift.findUnique({ where: { id } });
        if (!existing) throw new Error('Shift not found');

        // If time or employee is changing, check for conflicts
        const empId = data.employeeId || existing.employeeId;
        const start = data.startTime ? new Date(data.startTime) : existing.startTime;
        const end = data.endTime ? new Date(data.endTime) : existing.endTime;

        const conflict = await this.checkConflict(empId, start, end, id);
        if (conflict) {
            throw new Error(
                `Shift conflict: Employee already has a shift "${conflict.title}" from ${conflict.startTime.toISOString()} to ${conflict.endTime.toISOString()}`
            );
        }

        return prisma.shift.update({
            where: { id },
            data: {
                title: data.title,
                startTime: data.startTime ? new Date(data.startTime) : undefined,
                endTime: data.endTime ? new Date(data.endTime) : undefined,
                employeeId: data.employeeId,
                status: data.status as any,
                notes: data.notes,
            },
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, department: true },
                },
            },
        });
    }

    async delete(id: string) {
        const shift = await prisma.shift.findUnique({ where: { id } });
        if (!shift) throw new Error('Shift not found');

        await prisma.shift.delete({ where: { id } });
        return { message: 'Shift deleted successfully' };
    }

    private async checkConflict(
        employeeId: string,
        startTime: Date,
        endTime: Date,
        excludeId?: string
    ) {
        const where: any = {
            employeeId,
            status: { not: 'CANCELLED' },
            AND: [
                { startTime: { lt: endTime } },
                { endTime: { gt: startTime } },
            ],
        };

        if (excludeId) {
            where.id = { not: excludeId };
        }

        return prisma.shift.findFirst({ where });
    }
}

export default new ShiftService();
