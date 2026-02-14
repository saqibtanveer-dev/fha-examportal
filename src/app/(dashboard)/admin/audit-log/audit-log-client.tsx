'use client';

import { useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader, EmptyState } from '@/components/shared';
import { formatDateTime } from '@/utils/format';
import { Search, Shield } from 'lucide-react';
import type { PaginatedResult } from '@/utils/pagination';

type AuditEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string | null;
  createdAt: Date;
  user: { id: string; firstName: string; lastName: string; email: string } | null;
};

type Props = { result: PaginatedResult<AuditEntry> };

export function AuditLogClient({ result }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/admin/audit-log?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Track all system actions"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Audit Log' }]}
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter by action..."
          defaultValue={searchParams.get('action') ?? ''}
          onChange={(e) => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => updateFilter('action', e.target.value), 400);
          }}
          className="pl-9"
        />
      </div>

      {result.data.length === 0 ? (
        <EmptyState icon={<Shield className="h-12 w-12 text-muted-foreground" />} title="No logs" description="No audit entries found." />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>User</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.entityType} <span className="text-muted-foreground">({log.entityId.slice(0, 8)})</span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.ipAddress ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(log.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
