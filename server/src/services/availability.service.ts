import prisma from '../config/database';

export class AvailabilityService {
    async getByEmployee(employeeId: string) {
        return prisma.availability.findMany({
            where: { employeeId },
            orderBy: { dayOfWeek: 'asc' },
        });
    }

    async getAll() {
        return prisma.availability.findMany({
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, department: true },
                },
            },
            orderBy: [{ employeeId: 'asc' }, { dayOfWeek: 'asc' }],
        });
    }

    async set(employeeId: string, availabilities: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isActive?: boolean;
    }[]) {
        // Delete existing availability for this employee
        await prisma.availability.deleteMany({ where: { employeeId } });

        // Create new availability entries
        const created = await prisma.availability.createMany({
            data: availabilities.map((a) => ({
                employeeId,
                dayOfWeek: a.dayOfWeek,
                startTime: a.startTime,
                endTime: a.endTime,
                isActive: a.isActive ?? true,
            })),
        });

        return prisma.availability.findMany({
            where: { employeeId },
            orderBy: { dayOfWeek: 'asc' },
        });
    }

    async delete(id: string) {
        const avail = await prisma.availability.findUnique({ where: { id } });
        if (!avail) throw new Error('Availability not found');

        await prisma.availability.delete({ where: { id } });
        return { message: 'Availability deleted successfully' };
    }
}

export default new AvailabilityService();
