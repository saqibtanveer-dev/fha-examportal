'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Trash2, Users, Trophy, Settings2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared';
import { CampaignStatusBadge } from './campaign-status-badge';
import { deleteCampaignAction } from '../admission-actions';
import { useInvalidateCache } from '@/lib/cache-utils';
import { ROUTES } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';

type CampaignRow = {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  hasScholarship: boolean;
  testDuration: number;
  totalMarks: number;
  maxSeats: number | null;
  registrationStartAt: string | null;
  registrationEndAt: string | null;
  testStartAt: string | null;
  testEndAt: string | null;
  createdAt: string;
  _count?: {
    applicants?: number;
    campaignQuestions?: number;
  };
};

type Props = {
  campaigns: CampaignRow[];
};

export function CampaignTable({ campaigns }: Props) {
  const router = useRouter();
  const invalidate = useInvalidateCache();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteCampaignAction(deleteId);
      if (result.success) {
        toast.success('Campaign deleted');
        invalidate.campaigns();
      } else {
        toast.error(result.error);
      }
      setDeleteId(null);
    });
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        {/* ── Mobile Card View ── */}
        <div className="space-y-2 p-2 md:hidden">
          {campaigns.map((c) => (
            <div key={c.id} className="rounded-lg border bg-card p-3 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Link href={ROUTES.ADMIN_ADMISSIONS.CAMPAIGN_DETAIL(c.id)} className="text-sm font-medium hover:underline truncate flex-1">
                  {c.name}
                </Link>
                <CampaignStatusBadge status={c.status} />
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="capitalize">{c.type.replace('_', ' ').toLowerCase()}</span>
                <span>{c._count?.applicants ?? 0} applicants</span>
                <span>{c.testDuration}min</span>
                {c.hasScholarship && <Trophy className="h-3 w-3 text-yellow-500" />}
              </div>
            </div>
          ))}
        </div>

        {/* ── Desktop Table View ── */}
        <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Applicants</TableHead>
              <TableHead className="hidden lg:table-cell">Questions</TableHead>
              <TableHead className="hidden lg:table-cell">Duration</TableHead>
              <TableHead className="hidden md:table-cell">Scholarship</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link
                    href={ROUTES.ADMIN_ADMISSIONS.CAMPAIGN_DETAIL(c.id)}
                    className="font-medium hover:underline"
                  >
                    {c.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : ''}
                  </p>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="capitalize text-sm">{c.type.replace('_', ' ').toLowerCase()}</span>
                </TableCell>
                <TableCell>
                  <CampaignStatusBadge status={c.status} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {c._count?.applicants ?? 0}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {c._count?.campaignQuestions ?? 0}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {c.testDuration} min
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {c.hasScholarship ? (
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(ROUTES.ADMIN_ADMISSIONS.CAMPAIGN_DETAIL(c.id))}>
                        <Eye className="mr-2 h-4 w-4" />View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.ADMIN_ADMISSIONS.CAMPAIGN_APPLICANTS(c.id))}>
                        <Users className="mr-2 h-4 w-4" />Applicants
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.ADMIN_ADMISSIONS.CAMPAIGN_QUESTIONS(c.id))}>
                        <Settings2 className="mr-2 h-4 w-4" />Manage Questions
                      </DropdownMenuItem>
                      {c.status === 'DRAFT' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(c.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Campaign"
        description="This will permanently delete this campaign. This action cannot be undone."
        onConfirm={handleDelete}
        isLoading={isPending}
        variant="destructive"
      />
    </>
  );
}
