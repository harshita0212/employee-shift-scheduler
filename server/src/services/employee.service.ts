import prisma from '../config/database';

export class EmployeeService {
    async getAll(page = 1, limit = 10, search?: string) {
        const skip = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { firstName: { contains: search, mode: 'insensitive' as const } },
                    { lastName: { contains: search, mode: 'insensitive' as const } },
                    { department: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        const [employees, total] = await Promise.all([
            prisma.employee.findMany({
                where,
                skip,
                take: limit,
                include: { user: { select: { email: true, role: true } } },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.employee.count({ where }),
        ]);

        return {
            employees,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getById(id: string) {
        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                user: { select: { email: true, role: true } },
                shifts: { orderBy: { startTime: 'desc' }, take: 10 },
                leaves: { orderBy: { startDate: 'desc' }, take: 10 },
                availabilities: true,
            },
        });

        if (!employee) throw new Error('Employee not found');
        return employee;
    }

    async create(data: {
        firstName: string;
        lastName: string;
        phone?: string;
        department?: string;
        position?: string;
        email: string;
        password: string;
        role?: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
    }) {
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(data.password, 10);

        return prisma.employee.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                department: data.department,
                position: data.position,
                user: {
                    create: {
                        email: data.email,
                        password: hashedPassword,
                        role: data.role || 'EMPLOYEE',
                    },
                },
            },
            include: { user: { select: { email: true, role: true } } },
        });
    }

    async update(id: string, data: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        department?: string;
        position?: string;
        isActive?: boolean;
    }) {
        const employee = await prisma.employee.findUnique({ where: { id } });
        if (!employee) throw new Error('Employee not found');

        return prisma.employee.update({
            where: { id },
            data,
            include: { user: { select: { email: true, role: true } } },
        });
    }

    async delete(id: string) {
        const employee = await prisma.employee.findUnique({ where: { id } });
        if (!employee) throw new Error('Employee not found');

        await prisma.employee.delete({ where: { id } });
        return { message: 'Employee deleted successfully' };
    }
}

export default new EmployeeService();
