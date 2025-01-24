import { PrismaClient } from '@prisma/client';

// Create PrismaClient
const prisma = new PrismaClient();

// Export
export { prisma as db };