import { PrismaClient } from '@prisma/client';

// One client per process. In dev, Next re-imports modules on every edit, so we park the
// client on globalThis; otherwise each hot reload would open a new connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Under Vitest, tests trigger constraint errors on purpose; don't print them.
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: process.env.VITEST ? [] : ['warn', 'error'] });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
