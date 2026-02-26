import prisma from '../config/database';

export class LeaveService {
    async getAll(filters?: { employeeId?: string; status?: string }) {
        const where: any = {};
        if (filters?.employeeId) where.employeeId = filters.employeeId;
        if (filters?.status) where.status = filters.status;

        return prisma.leave.findMany({
            where,
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, department: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getById(id: string) {
        const leave = await prisma.leave.findUnique({
            where: { id },
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, department: true },
                },
            },
        });
        if (!leave) throw new Error('Leave request not found');
        return leave;
    }

    async create(data: {
        startDate: string;
        endDate: string;
        reason?: string;
        type?: string;
        employeeId: string;
    }) {
        return prisma.leave.create({
            data: {
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                reason: data.reason,
                type: data.type || 'PERSONAL',
                employeeId: data.employeeId,
            },
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, department: true },
                },
            },
        });
    }

    async updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
        const leave = await prisma.leave.findUnique({ where: { id } });
        if (!leave) throw new Error('Leave request not found');

        return prisma.leave.update({
            where: { id },
            data: { status },
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, department: true },
                },
            },
        });
    }

    async delete(id: string) {
        const leave = await prisma.leave.findUnique({ where: { id } });
        if (!leave) throw new Error('Leave request not found');

        await prisma.leave.delete({ where: { id } });
        return { message: 'Leave request deleted successfully' };
    }
}

export default new LeaveService();
