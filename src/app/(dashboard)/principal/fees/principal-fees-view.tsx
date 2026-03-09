'use client';

import { PageHeader } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/modules/fees/components/fee-status-badge';
import { DollarSign, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import type { FeeOverview, ClassWiseSummary } from '@/modules/fees/fee.types';

type DefaulterItem = {
  id: string;
  generatedForMonth: string;
  totalAmount: number;
  balanceAmount: number;
  dueDate: string;
  studentProfile: {
    rollNumber: string;
    user: { firstName: string; lastName: string };
    class: { name: string } | null;
    section: { name: string } | null;
  };
};

type Props = {
  overview: FeeOverview | null;
  classWise: ClassWiseSummary[];
  defaulters: DefaulterItem[];
};

export function PrincipalFeesView({ overview, classWise, defaulters }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Overview"
        description="School-wide fee collection summary and reports."
        breadcrumbs={[{ label: 'Principal', href: '/principal' }, { label: 'Fees' }]}
      />

      {/* Summary Cards */}
      {overview && (
        <div className="grid gap-4 md:grid-cols-4">
          <SummaryCard
            title="Total Fees" value={formatCurrency(overview.totalDue)}
            icon={DollarSign} iconColor="text-blue-500"
          />
          <SummaryCard
            title="Collected" value={formatCurrency(overview.totalCollected)}
            icon={TrendingUp} iconColor="text-green-500"
          />
          <SummaryCard
            title="Outstanding" value={formatCurrency(overview.totalOutstanding)}
            icon={AlertTriangle} iconColor="text-amber-500"
          />
          <SummaryCard
            title="Collection Rate" value={`${overview.collectionPercentage.toFixed(1)}%`}
            icon={Users} iconColor="text-purple-500"
            subtitle={`${overview.paidCount} paid · ${overview.partialCount} partial · ${overview.unpaidCount} unpaid`}
          />
        </div>
      )}

      {/* Tabs: Class-wise | Defaulters */}
      <Tabs defaultValue="class-wise">
        <TabsList>
          <TabsTrigger value="class-wise">Class-wise Summary</TabsTrigger>
          <TabsTrigger value="defaulters">
            Defaulters
            {defaulters.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-[10px] px-1.5 py-0">
                {defaulters.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="class-wise" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Class-wise Fee Collection</CardTitle>
            </CardHeader>
            <CardContent>
              {classWise.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No data available.</p>
              ) : (
                <div className="overflow-x-auto rounded-md border">
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
                      {classWise.map((c) => (
                        <TableRow key={c.classId}>
                          <TableCell className="font-medium">{c.className}</TableCell>
                          <TableCell className="text-right">{c.studentCount}</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(c.totalDue)}</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(c.totalCollected)}</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(c.totalOutstanding)}</TableCell>
                          <TableCell className="text-right">
                            <CollectionBadge pct={c.collectionPercentage} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defaulters" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Overdue Students</CardTitle>
            </CardHeader>
            <CardContent>
              {defaulters.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No defaulters — all fees are up to date!
                </p>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Due</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Days Overdue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {defaulters.map((d) => {
                        const daysOverdue = Math.max(
                          0,
                          Math.floor((Date.now() - new Date(d.dueDate).getTime()) / 86400000),
                        );
                        return (
                          <TableRow key={d.id}>
                            <TableCell className="font-medium">
                              {d.studentProfile.user.firstName} {d.studentProfile.user.lastName}
                            </TableCell>
                            <TableCell>{d.studentProfile.class?.name ?? '—'}</TableCell>
                            <TableCell>{d.generatedForMonth}</TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(d.totalAmount)}</TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(d.balanceAmount)}</TableCell>
                            <TableCell>
                              <Badge variant={daysOverdue > 30 ? 'destructive' : 'secondary'}>
                                {daysOverdue}d
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------- helpers ---------- */

function SummaryCard({
  title, value, icon: Icon, iconColor, subtitle,
}: { title: string; value: string; icon: React.FC<{ className?: string }>; iconColor: string; subtitle?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <Icon className={`h-8 w-8 ${iconColor} opacity-50`} />
        </div>
      </CardContent>
    </Card>
  );
}

function CollectionBadge({ pct }: { pct: number }) {
  const variant = pct >= 90 ? 'default' : pct >= 60 ? 'secondary' : 'destructive';
  return <Badge variant={variant}>{pct.toFixed(1)}%</Badge>;
}
