'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Users,
  Settings,
  Layers,
  CreditCard,
  BarChart3,
  Cog,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { FeeSettingsDialog } from '@/modules/fees/components/fee-settings-dialog';
import type { FeeOverview, ClassWiseSummary, SerializedFeeSettings } from '@/modules/fees/fee.types';

type Props = {
  overview: FeeOverview | null;
  classSummary: ClassWiseSummary[];
  settings: SerializedFeeSettings | null;
};

export function FeesOverviewView({ overview, classSummary, settings }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Management"
        description="Overview of fee collection across the school"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Fees' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={ROUTES.ADMIN.FEES_CATEGORIES}>
                <Layers className="mr-2 h-4 w-4" />Categories
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={ROUTES.ADMIN.FEES_STRUCTURES}>
                <Settings className="mr-2 h-4 w-4" />Structures
              </Link>
            </Button>
            <Button asChild>
              <Link href={ROUTES.ADMIN.FEES_COLLECT}>
                <CreditCard className="mr-2 h-4 w-4" />Collect Fees
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
              <Cog className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      {overview && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Due"
            value={formatCurrency(overview.totalDue)}
            icon={DollarSign}
          />
          <StatCard
            title="Collected"
            value={formatCurrency(overview.totalCollected)}
            subtitle={`${overview.collectionPercentage}%`}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="Outstanding"
            value={formatCurrency(overview.totalOutstanding)}
            icon={AlertTriangle}
            variant="warning"
          />
          <StatCard
            title="Students"
            value={String(overview.totalStudents)}
            subtitle={`${overview.paidCount} paid · ${overview.partialCount} partial · ${overview.unpaidCount} unpaid`}
            icon={Users}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <Link href={ROUTES.ADMIN.FEES_GENERATE}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Generate Fees</p>
                <p className="text-sm text-muted-foreground">Create monthly fee assignments</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <Link href={ROUTES.ADMIN.FEES_COLLECT}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-green-500/10 p-3">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold">Collect Payment</p>
                <p className="text-sm text-muted-foreground">Record student or family payment</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <Link href={ROUTES.ADMIN.FEES_REPORTS}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">Reports</p>
                <p className="text-sm text-muted-foreground">Class-wise, defaulters &amp; more</p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Class-wise Summary Table */}
      {classSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Class-wise Collection</CardTitle>
          </CardHeader>
          <CardContent>
            {/* ── Mobile Card View ── */}
            <div className="space-y-2 md:hidden">
              {classSummary.map((cs) => (
                <div key={cs.classId} className="rounded-lg border bg-card p-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{cs.className}</p>
                    <Badge variant={cs.collectionPercentage >= 80 ? 'default' : cs.collectionPercentage >= 50 ? 'secondary' : 'destructive'}>
                      {cs.collectionPercentage}%
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{cs.studentCount} students</span>
                    <span>Due: <span className="font-mono text-foreground">{formatCurrency(cs.totalDue)}</span></span>
                    <span>Paid: <span className="font-mono text-foreground">{formatCurrency(cs.totalCollected)}</span></span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Desktop Table View ── */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead className="text-right">Total Due</TableHead>
                    <TableHead className="text-right">Collected</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead className="text-right">Collection %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classSummary.map((cs) => (
                    <TableRow key={cs.classId}>
                      <TableCell className="font-medium">{cs.className}</TableCell>
                      <TableCell className="text-right">{cs.studentCount}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cs.totalDue)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cs.totalCollected)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cs.totalOutstanding)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={cs.collectionPercentage >= 80 ? 'default' : cs.collectionPercentage >= 50 ? 'secondary' : 'destructive'}>
                          {cs.collectionPercentage}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      <FeeSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} settings={settings} />
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success' | 'warning';
}) {
  const colorMap = {
    default: 'text-muted-foreground',
    success: 'text-green-600',
    warning: 'text-amber-600',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${colorMap[variant]}`}>{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <Icon className={`h-8 w-8 ${colorMap[variant]} opacity-50`} />
        </div>
      </CardContent>
    </Card>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
