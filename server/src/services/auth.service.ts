import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { env } from '../config/env';



export class AuthService {
    async register(email: string, password: string, role: string = 'EMPLOYEE') {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        const token = this.generateToken(user.id, user.email, user.role);

        return { user, token };
    }

    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { employee: true },
        });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }

        const token = this.generateToken(user.id, user.email, user.role);

        const { password: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, token };
    }

    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                employee: true,
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    private generateToken(id: string, email: string, role: string): string {
        return jwt.sign({ id, email, role }, env.JWT_SECRET, {
            expiresIn: env.JWT_EXPIRES_IN as any,
        });
    }
}

export default new AuthService();
