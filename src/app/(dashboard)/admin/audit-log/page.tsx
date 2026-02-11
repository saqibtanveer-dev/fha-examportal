import { listAuditLogs } from '@/modules/audit/audit-queries';
import { AuditLogClient } from './audit-log-client';

type Props = {
  searchParams: Promise<{ page?: string; action?: string }>;
};

export default async function AuditLogPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const result = await listAuditLogs({ page, pageSize: 30 }, { action: params.action });
  return <AuditLogClient result={result} />;
}
