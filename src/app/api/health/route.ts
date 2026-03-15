import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();

  try {
    // Lightweight DB connectivity check
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - start;

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        db: { connected: true, latencyMs: dbLatency },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        db: { connected: false },
      },
      { status: 503 },
    );
  }
}
