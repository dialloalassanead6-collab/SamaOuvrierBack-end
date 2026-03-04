/**
 * Prisma Client Singleton
 * Single instance for the entire application
 */
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
