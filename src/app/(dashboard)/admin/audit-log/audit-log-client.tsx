'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader, EmptyState, PaginationControls } from '@/components/shared';
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
  const [filterValue, setFilterValue] = useState(searchParams.get('action') ?? '');

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/admin/audit-log?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateFilter('action', filterValue);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/admin/audit-log?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Track all system actions"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Audit Log' }]}
      />

      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter by action..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" size="sm">
          Search
        </Button>
      </form>

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

      {/* Pagination */}
      <PaginationControls
        currentPage={result.pagination.page}
        totalPages={result.pagination.totalPages}
        totalCount={result.pagination.totalCount}
        pageSize={result.pagination.pageSize}
        onPageChange={goToPage}
      />
    </div>
  );
}
