import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Use Neon serverless adapter in production for proper connection pooling
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
    return new PrismaClient({ adapter, log: ['error'] });
  }

  // Development: standard PrismaClient with query logging
  return new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
