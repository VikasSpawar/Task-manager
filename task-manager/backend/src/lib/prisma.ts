import { PrismaClient, User } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
export const prisma = new PrismaClient();
export type { User };