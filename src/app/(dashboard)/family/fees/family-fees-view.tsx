'use client';

import { PageHeader, EmptyState } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  FeeStatusBadge, PaymentStatusBadge, formatCurrency, formatMonth,
} from '@/modules/fees/components/fee-status-badge';
import { DollarSign, Users, Receipt } from 'lucide-react';
import type { SerializedFamilyPayment } from '@/modules/fees/fee.types';
import type { fetchFamilyFeesOverviewAction } from '@/modules/fees/fee-self-service-actions';

type Props = {
  data: Awaited<ReturnType<typeof fetchFamilyFeesOverviewAction>>;
};

export function FamilyFeesView({ data }: Props) {
  const { children, familyPayments } = data;

  const totalDue = children.reduce(
    (s, c) => s + c.assignments.reduce((a, f) => a + f.totalAmount, 0), 0,
  );
  const totalPaid = children.reduce(
    (s, c) => s + c.assignments.reduce((a, f) => a + f.paidAmount, 0), 0,
  );
  const totalBalance = children.reduce(
    (s, c) => s + c.assignments.reduce((a, f) => a + f.balanceAmount, 0), 0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Family Fees"
        description="View fee assignments and payment history for all your children."
        breadcrumbs={[{ label: 'Family', href: '/family' }, { label: 'Fees' }]}
      />

      {children.length === 0 ? (
        <EmptyState
          title="No children linked"
          description="No children with fee data found."
        />
      ) : (
        <>
          {/* Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Fees</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalDue)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalBalance)}</p>
                  </div>
                  <Receipt className="h-8 w-8 text-amber-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs: per child + payments */}
          <Tabs defaultValue={children[0]?.child.id ?? 'payments'}>
            <TabsList className="flex-wrap">
              {children.map((c) => (
                <TabsTrigger key={c.child.id} value={c.child.id}>
                  {c.child.user.firstName} ({c.child.class?.name ?? 'N/A'})
                </TabsTrigger>
              ))}
              <TabsTrigger value="payments">Payment History</TabsTrigger>
            </TabsList>

            {/* Per-child fee assignments */}
            {children.map((c) => (
              <TabsContent key={c.child.id} value={c.child.id} className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {c.child.user.firstName} {c.child.user.lastName} — {c.child.class?.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {c.assignments.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No fees assigned yet.
                      </p>
                    ) : (
                      <div className="overflow-x-auto rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Month</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                              <TableHead className="text-right">Paid</TableHead>
                              <TableHead className="text-right">Balance</TableHead>
                              <TableHead>Due Date</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {c.assignments.map((a) => (
                              <TableRow key={a.id}>
                                <TableCell className="font-medium">{formatMonth(a.generatedForMonth)}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(a.totalAmount)}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(a.paidAmount)}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(a.balanceAmount)}</TableCell>
                                <TableCell>{new Date(a.dueDate).toLocaleDateString('en-PK')}</TableCell>
                                <TableCell><FeeStatusBadge status={a.status} /></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}

            {/* Payment History */}
            <TabsContent value="payments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Family Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  {familyPayments.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No payments recorded yet.
                    </p>
                  ) : (
                    <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Receipt</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {familyPayments.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell className="font-mono text-sm">{p.masterReceiptNumber}</TableCell>
                              <TableCell className="text-right font-mono">{formatCurrency(p.totalAmount)}</TableCell>
                              <TableCell>{p.paymentMethod}</TableCell>
                              <TableCell>{new Date(p.paidAt).toLocaleDateString('en-PK')}</TableCell>
                              <TableCell><PaymentStatusBadge status={p.status} /></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
