import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create Admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@company.com' },
        update: {},
        create: {
            email: 'admin@company.com',
            password: adminPassword,
            role: 'ADMIN',
            employee: {
                create: {
                    firstName: 'System',
                    lastName: 'Admin',
                    department: 'IT',
                    position: 'Administrator',
                },
            },
        },
    });

    // Create Manager user
    const managerPassword = await bcrypt.hash('manager123', 10);
    const manager = await prisma.user.upsert({
        where: { email: 'manager@company.com' },
        update: {},
        create: {
            email: 'manager@company.com',
            password: managerPassword,
            role: 'MANAGER',
            employee: {
                create: {
                    firstName: 'Jane',
                    lastName: 'Manager',
                    department: 'Operations',
                    position: 'Shift Manager',
                },
            },
        },
    });

    // Create Employee users
    const empPassword = await bcrypt.hash('employee123', 10);
    const employees = [
        { email: 'john@company.com', firstName: 'John', lastName: 'Doe', department: 'Sales', position: 'Sales Associate' },
        { email: 'sarah@company.com', firstName: 'Sarah', lastName: 'Smith', department: 'Support', position: 'Support Agent' },
        { email: 'mike@company.com', firstName: 'Mike', lastName: 'Johnson', department: 'Sales', position: 'Sales Lead' },
    ];

    for (const emp of employees) {
        await prisma.user.upsert({
            where: { email: emp.email },
            update: {},
            create: {
                email: emp.email,
                password: empPassword,
                role: 'EMPLOYEE',
                employee: {
                    create: {
                        firstName: emp.firstName,
                        lastName: emp.lastName,
                        department: emp.department,
                        position: emp.position,
                    },
                },
            },
        });
    }

    console.log('✅ Seeding completed!');
    console.log('📧 Admin: admin@company.com / admin123');
    console.log('📧 Manager: manager@company.com / manager123');
    console.log('📧 Employees: john/sarah/mike@company.com / employee123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
