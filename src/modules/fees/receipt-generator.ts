import { prisma } from '@/lib/prisma';

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
export type DbClient = typeof prisma | TxClient;

function datePrefix(prefix: string): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `${prefix}-${dateStr}`;
}

function fallback(basePrefix: string): string {
  return `${basePrefix}-${Date.now().toString(36).toUpperCase()}`;
}

export async function generateReceiptNumber(
  prefix: string,
  tx: DbClient = prisma,
): Promise<string> {
  const basePrefix = datePrefix(prefix);

  const existing = await tx.feePayment.findMany({
    where: { receiptNumber: { startsWith: basePrefix } },
    select: { receiptNumber: true },
    orderBy: { receiptNumber: 'desc' },
    take: 1,
  });

  let nextSeq = 1;
  if (existing.length > 0) {
    const parsed = parseInt(existing[0]!.receiptNumber.split('-').pop() ?? '', 10);
    if (!isNaN(parsed)) nextSeq = parsed + 1;
  }

  for (let attempt = nextSeq; attempt <= nextSeq + 5; attempt++) {
    const candidate = `${basePrefix}-${String(attempt).padStart(4, '0')}`;
    const exists = await tx.feePayment.findUnique({
      where: { receiptNumber: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }

  return fallback(basePrefix);
}

export async function generateFamilyReceiptNumber(
  prefix: string,
  tx: DbClient = prisma,
): Promise<string> {
  const basePrefix = datePrefix(prefix);

  const existing = await tx.familyPayment.findMany({
    where: { masterReceiptNumber: { startsWith: basePrefix } },
    select: { masterReceiptNumber: true },
    orderBy: { masterReceiptNumber: 'desc' },
    take: 1,
  });

  let nextSeq = 1;
  if (existing.length > 0) {
    const parsed = parseInt(existing[0]!.masterReceiptNumber.split('-').pop() ?? '', 10);
    if (!isNaN(parsed)) nextSeq = parsed + 1;
  }

  for (let attempt = nextSeq; attempt <= nextSeq + 5; attempt++) {
    const candidate = `${basePrefix}-${String(attempt).padStart(4, '0')}`;
    const exists = await tx.familyPayment.findFirst({
      where: { masterReceiptNumber: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }

  return fallback(basePrefix);
}
