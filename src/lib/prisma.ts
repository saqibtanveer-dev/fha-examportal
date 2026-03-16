import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Trigger.dev hosted Node runtimes may not expose a global WebSocket.
// Neon Pool/Client transport needs an explicit constructor in that case.
if (typeof WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const adapter = new PrismaNeon({ connectionString: url });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV !== 'production' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

if (typeof process !== 'undefined') {
  const disconnect = () => { prisma.$disconnect().catch(() => {}); };
  process.once('beforeExit', disconnect);
  process.once('SIGINT', disconnect);
  process.once('SIGTERM', disconnect);
}
