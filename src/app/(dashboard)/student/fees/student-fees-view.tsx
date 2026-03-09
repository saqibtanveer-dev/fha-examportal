'use client';

import { PageHeader, EmptyState } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import {
  FeeStatusBadge, formatCurrency, formatMonth,
} from '@/modules/fees/components/fee-status-badge';
import { DollarSign, CheckCircle, Clock } from 'lucide-react';
import type { SerializedFeeAssignment } from '@/modules/fees/fee.types';

type Props = { fees: SerializedFeeAssignment[] };

export function StudentFeesView({ fees }: Props) {
  const totalDue = fees.reduce((s, f) => s + f.totalAmount, 0);
  const totalPaid = fees.reduce((s, f) => s + f.paidAmount, 0);
  const totalBalance = fees.reduce((s, f) => s + f.balanceAmount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Fees"
        description="View your fee assignments and payment history."
        breadcrumbs={[{ label: 'Student', href: '/student' }, { label: 'Fees' }]}
      />

      {fees.length === 0 ? (
        <EmptyState
          title="No fees assigned"
          description="No fee assignments found for the current session."
        />
      ) : (
        <>
          {/* Summary Cards */}
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
                    <p className="text-sm text-muted-foreground">Paid</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
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
                  <Clock className="h-8 w-8 text-amber-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fee Details - Accordion per month */}
          <Card>
            <CardHeader>
              <CardTitle>Fee Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {fees.map((fee) => (
                  <AccordionItem key={fee.id} value={fee.id}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-4 text-left">
                        <span className="font-medium">{formatMonth(fee.generatedForMonth)}</span>
                        <FeeStatusBadge status={fee.status} />
                        <span className="ml-auto font-mono text-sm">
                          {formatCurrency(fee.balanceAmount)} remaining
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="overflow-x-auto rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Fee Type</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {fee.lineItems.map((li) => (
                              <TableRow key={li.id}>
                                <TableCell>{li.categoryName}</TableCell>
                                <TableCell className="text-right font-mono">
                                  {formatCurrency(li.amount)}
                                </TableCell>
                              </TableRow>
                            ))}
                            {fee.lateFeesApplied > 0 && (
                              <TableRow>
                                <TableCell className="text-orange-600">Late Fee</TableCell>
                                <TableCell className="text-right font-mono text-orange-600">
                                  {formatCurrency(fee.lateFeesApplied)}
                                </TableCell>
                              </TableRow>
                            )}
                            {fee.discountAmount > 0 && (
                              <TableRow>
                                <TableCell className="text-green-600">Discount</TableCell>
                                <TableCell className="text-right font-mono text-green-600">
                                  -{formatCurrency(fee.discountAmount)}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                        <span>Due: {new Date(fee.dueDate).toLocaleDateString('en-PK')}</span>
                        <span>Paid: {formatCurrency(fee.paidAmount)} / {formatCurrency(fee.totalAmount)}</span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
