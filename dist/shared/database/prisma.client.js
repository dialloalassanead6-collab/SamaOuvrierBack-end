// Prisma Client Singleton - Avoids multiple database connections
import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
if (process.env['NODE_ENV'] !== 'production') {
    globalForPrisma.prisma = prisma;
}
export default prisma;
//# sourceMappingURL=prisma.client.js.map