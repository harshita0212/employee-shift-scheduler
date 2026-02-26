import prisma from '../config/database';

export class DashboardService {
    async getStats() {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const [
            totalEmployees,
            activeEmployees,
            todayShifts,
            weekShifts,
            pendingLeaves,
            approvedLeaves,
            shiftsByStatus,
            departmentStats,
            recentShifts,
            upcomingLeaves,
        ] = await Promise.all([
            prisma.employee.count(),
            prisma.employee.count({ where: { isActive: true } }),
            prisma.shift.count({
                where: {
                    startTime: { gte: startOfDay },
                    endTime: { lte: endOfDay },
                },
            }),
            prisma.shift.count({
                where: {
                    startTime: { gte: startOfWeek },
                    endTime: { lte: endOfWeek },
                },
            }),
            prisma.leave.count({ where: { status: 'PENDING' } }),
            prisma.leave.count({ where: { status: 'APPROVED' } }),
            prisma.shift.groupBy({
                by: ['status'],
                _count: { id: true },
            }),
            prisma.employee.groupBy({
                by: ['department'],
                _count: { id: true },
                where: { department: { not: null } },
            }),
            prisma.shift.findMany({
                take: 5,
                orderBy: { startTime: 'desc' },
                include: {
                    employee: {
                        select: { firstName: true, lastName: true, department: true },
                    },
                },
            }),
            prisma.leave.findMany({
                where: {
                    status: 'APPROVED',
                    startDate: { gte: now },
                },
                take: 5,
                orderBy: { startDate: 'asc' },
                include: {
                    employee: {
                        select: { firstName: true, lastName: true, department: true },
                    },
                },
            }),
        ]);

        return {
            overview: {
                totalEmployees,
                activeEmployees,
                todayShifts,
                weekShifts,
                pendingLeaves,
                approvedLeaves,
            },
            shiftsByStatus: shiftsByStatus.map((s) => ({
                status: s.status,
                count: s._count.id,
            })),
            departmentStats: departmentStats.map((d) => ({
                department: d.department,
                count: d._count.id,
            })),
            recentShifts,
            upcomingLeaves,
        };
    }
}

export default new DashboardService();
