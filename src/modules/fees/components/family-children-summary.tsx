'use client';

import { Input } from '@/components/ui/input';
import { formatCurrency, formatMonth } from './fee-status-badge';
import type { ChildWithAssignments } from '@/modules/fees/fee.types';

type Props = {
  children: ChildWithAssignments[];
  showAmountInputs: boolean;
  customAmounts: Record<string, string>;
  onCustomAmountChange: (assignmentId: string, value: string) => void;
  disabled?: boolean;
};

export function FamilyChildrenSummary({
  children,
  showAmountInputs,
  customAmounts,
  onCustomAmountChange,
  disabled,
}: Props) {
  return (
    <>
      {children.map((child) => (
        <div key={child.childId} className="rounded border p-3 space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>{child.childName} ({child.className})</span>
            <span className="font-mono">
              {formatCurrency(child.assignments.reduce((s, a) => s + a.balanceAmount, 0))}
            </span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            {child.assignments.map((a) => (
              <div key={a.assignmentId} className="flex items-center justify-between gap-2">
                <span className="shrink-0">{formatMonth(a.periodLabel)}</span>
                <span className="font-mono shrink-0">{formatCurrency(a.balanceAmount)}</span>
                {showAmountInputs && (
                  <Input
                    type="number"
                    min={0}
                    max={a.balanceAmount}
                    placeholder="0"
                    value={customAmounts[a.assignmentId] ?? ''}
                    onChange={(e) => onCustomAmountChange(a.assignmentId, e.target.value)}
                    className="h-7 w-24 font-mono text-xs"
                    disabled={disabled}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
