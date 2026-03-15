import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Receipt } from 'lucide-react';
import { FeeStatusBadge, formatCurrency, formatMonth } from './fee-status-badge';
import { StudentSearchCombobox } from './student-search-combobox';
import { Wallet, Tag, History } from 'lucide-react';
import type { SerializedFeeAssignment } from '@/modules/fees/fee.types';

type Props = {
  isPending: boolean;
  studentId: string;
  studentLabel: string;
  assignments: SerializedFeeAssignment[];
  selectedId: string;
  creditBalance: number;
  onSelectStudent: (payload: {
    studentProfileId: string;
    studentName: string;
    className: string;
    rollNumber: string;
  }) => void;
  onClearStudent: () => void;
  onOpenDiscounts: () => void;
  onOpenAdvance: () => void;
  onOpenLedger: () => void;
  onSelectAssignment: (assignmentId: string) => void;
  onOpenHistory: (assignmentId: string) => void;
};

export function StudentAssignmentList({
  isPending,
  studentId,
  studentLabel,
  assignments,
  selectedId,
  creditBalance,
  onSelectStudent,
  onClearStudent,
  onOpenDiscounts,
  onOpenAdvance,
  onOpenLedger,
  onSelectAssignment,
  onOpenHistory,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Find Student</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StudentSearchCombobox
          value={studentId}
          selectedLabel={studentLabel}
          disabled={isPending}
          onSelect={onSelectStudent}
          onClear={onClearStudent}
        />

        {studentId && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={onOpenDiscounts} disabled={isPending}>
                <Tag className="mr-1 h-3.5 w-3.5" /> Manage Discounts
              </Button>
              <Button size="sm" variant="outline" onClick={onOpenAdvance} disabled={isPending}>
                <Wallet className="mr-1 h-3.5 w-3.5" /> Record Advance Payment
              </Button>
              <Button size="sm" variant="outline" onClick={onOpenLedger} disabled={isPending}>
                <History className="mr-1 h-3.5 w-3.5" /> Payment Ledger
              </Button>
            </div>
            {creditBalance > 0 && (
              <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm dark:border-green-900 dark:bg-green-950">
                <Wallet className="h-4 w-4 text-green-600" />
                <span className="text-green-700 dark:text-green-400">
                  Available Credit: <span className="font-mono font-semibold">{formatCurrency(creditBalance)}</span>{' '}
                  (auto-applies to new fees)
                </span>
              </div>
            )}
          </div>
        )}

        {assignments.length > 0 && (
          <>
            <div className="space-y-2 md:hidden">
              {assignments.map((a) => (
                <div
                  key={a.id}
                  className={`rounded-lg border p-3 space-y-1 cursor-pointer ${selectedId === a.id ? 'bg-muted ring-2 ring-primary' : 'bg-card'}`}
                  onClick={() => onSelectAssignment(a.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{formatMonth(a.generatedForMonth)}</p>
                    <FeeStatusBadge status={a.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono">{formatCurrency(a.balanceAmount)}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenHistory(a.id);
                      }}
                    >
                      <Receipt className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((a) => (
                    <TableRow
                      key={a.id}
                      className={selectedId === a.id ? 'bg-muted' : 'cursor-pointer'}
                      onClick={() => onSelectAssignment(a.id)}
                    >
                      <TableCell>{formatMonth(a.generatedForMonth)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(a.balanceAmount)}</TableCell>
                      <TableCell>
                        <FeeStatusBadge status={a.status} />
                      </TableCell>
                      <TableCell className="flex gap-1">
                        <Button
                          size="sm"
                          variant={selectedId === a.id ? 'default' : 'ghost'}
                          onClick={() => onSelectAssignment(a.id)}
                        >
                          Select
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenHistory(a.id);
                          }}
                        >
                          <Receipt className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
