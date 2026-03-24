'use client';

import { PageHeader, EmptyState } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import {
  FeeStatusBadge, formatCurrency, formatMonth,
} from '@/modules/fees/components/fee-status-badge';
import { DollarSign, CheckCircle, Clock, Wallet, Receipt } from 'lucide-react';
import type { SerializedFeeAssignmentWithPayments } from '@/modules/fees/fee.types';

type Props = { fees: SerializedFeeAssignmentWithPayments[]; creditBalance?: number };

export function StudentFeesView({ fees, creditBalance = 0 }: Props) {
  const totalDue = fees.reduce((s, f) => s + f.totalAmount, 0);
  const totalPaid = fees.reduce((s, f) => s + f.paidAmount, 0);
  const totalBalance = fees.reduce((s, f) => s + f.balanceAmount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Fees"
        description="View your fee assignments and payment receipts."
        breadcrumbs={[{ label: 'Student', href: '/student' }, { label: 'Fees' }]}
      />

      {fees.length === 0 ? (
        <EmptyState
          title="No fees assigned"
          description="No fee assignments found for the current session."
        />
      ) : (
        <>
          {/* ── Summary Cards ── */}
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs text-muted-foreground">Total Fees</p>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xl font-bold font-mono truncate">{formatCurrency(totalDue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-xl font-bold font-mono truncate text-green-600 dark:text-green-400">
                  {formatCurrency(totalPaid)}
                </p>
              </CardContent>
            </Card>
            <Card className="col-span-2 sm:col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <p className={`text-xl font-bold font-mono truncate ${totalBalance > 0 ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                  {formatCurrency(totalBalance)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ── Credit balance alert ── */}
          {creditBalance > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-950">
              <Wallet className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Available Credit: <span className="font-mono">{formatCurrency(creditBalance)}</span>
                </p>
                <p className="text-xs text-green-600/80 dark:text-green-500/80">
                  This credit is available for upcoming fee assignments.
                </p>
              </div>
            </div>
          )}

          {/* ── Fee Details: accordion per month ── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fee Details &amp; Payment Receipts</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {fees.map((fee) => (
                  <AccordionItem key={fee.id} value={fee.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2 sm:gap-4 text-left w-full pr-2 flex-wrap">
                        <span className="font-medium text-sm sm:text-base">{formatMonth(fee.generatedForMonth)}</span>
                        <FeeStatusBadge status={fee.status} />
                        {fee.balanceAmount > 0 && (
                          <span className="font-mono text-xs sm:text-sm text-amber-600 dark:text-amber-400 ml-auto">
                            {formatCurrency(fee.balanceAmount)} due
                          </span>
                        )}
                        {fee.balanceAmount === 0 && (
                          <span className="font-mono text-xs sm:text-sm text-green-600 dark:text-green-400 ml-auto">
                            Cleared
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {/* ── Fee breakdown ── */}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Fee Breakdown</p>
                          <div className="rounded-md border divide-y text-sm">
                            {fee.lineItems.map((li) => (
                              <div key={li.id} className="flex justify-between px-3 py-2">
                                <span>{li.categoryName}</span>
                                <span className="font-mono">{formatCurrency(li.amount)}</span>
                              </div>
                            ))}
                            {fee.lateFeesApplied > 0 && (
                              <div className="flex justify-between px-3 py-2 text-orange-600">
                                <span>Late Fee</span>
                                <span className="font-mono">{formatCurrency(fee.lateFeesApplied)}</span>
                              </div>
                            )}
                            {fee.discountAmount > 0 && (
                              <div className="flex justify-between px-3 py-2 text-green-600">
                                <span>Discount</span>
                                <span className="font-mono">-{formatCurrency(fee.discountAmount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between px-3 py-2 bg-muted/30 font-medium">
                              <span>Total</span>
                              <span className="font-mono">{formatCurrency(fee.totalAmount)}</span>
                            </div>
                          </div>
                        </div>

                        {/* ── Payment receipts ── */}
                        {fee.payments && fee.payments.length > 0 ? (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                              <Receipt className="h-3.5 w-3.5" />
                              Payment Receipts ({fee.payments.length})
                            </p>
                            <div className="space-y-2">
                              {fee.payments.map((p) => (
                                <div key={p.id} className="rounded-md border bg-muted/20 px-3 py-2 text-sm">
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                        {p.paymentMethod}
                                      </Badge>
                                      <span className="text-muted-foreground text-xs">
                                        {new Date(p.paidAt).toLocaleDateString('en-PK', {
                                          day: 'numeric', month: 'short', year: 'numeric',
                                        })}
                                      </span>
                                      {p.referenceNumber && (
                                        <span className="text-muted-foreground text-xs font-mono">
                                          Ref: {p.referenceNumber}
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                                      {formatCurrency(p.amount)}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                                    {p.receiptNumber}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : fee.paidAmount > 0 ? (
                          <p className="text-xs text-muted-foreground">
                            Payment recorded. Contact school for receipt details.
                          </p>
                        ) : null}

                        {/* ── Due date info ── */}
                        <p className="text-xs text-muted-foreground">
                          Due:{' '}
                          <span className="font-medium text-foreground">
                            {new Date(fee.dueDate).toLocaleDateString('en-PK', {
                              day: 'numeric', month: 'long', year: 'numeric',
                            })}
                          </span>
                          {fee.balanceAmount > 0 && ' · '}
                          {fee.balanceAmount > 0 && (
                            <span className="text-amber-600 font-medium">
                              {formatCurrency(fee.balanceAmount)} remaining
                            </span>
                          )}
                        </p>
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
