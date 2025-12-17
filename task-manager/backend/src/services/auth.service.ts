// backend/src/services/auth.service.ts
import { prisma, User } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Validation Schemas
export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthService {
  
  async register(data: z.infer<typeof RegisterSchema>) {
    // 1. Check if user exists
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) throw new Error('User already exists');

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. Create User
    const user = await prisma.user.create({
      data: { ...data, password: hashedPassword },
    });

    // 4. Generate Token
    return this.generateToken(user);
  }

  async login(data: z.infer<typeof LoginSchema>) {
    // 1. Find User
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new Error('Invalid credentials');

    // 2. Check Password
    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) throw new Error('Invalid credentials');

    // 3. Generate Token
    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return { user: { id: user.id, email: user.email, name: user.name }, token };
  }
}