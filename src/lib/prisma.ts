import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Always use the Neon serverless adapter — avoids P1001 TCP cold-start drops
  // in both dev and production. Standard TCP Prisma loses connection when Neon
  // suspends idle compute; the HTTP-based Neon adapter reconnects transparently.
  if (process.env.DATABASE_URL) {
    const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV !== 'production' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  // Fallback for local Postgres (no DATABASE_URL set)
  return new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
