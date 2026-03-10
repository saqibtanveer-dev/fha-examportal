'use client';

import { Input } from '@/components/ui/input';
import { formatCurrency, formatMonth } from './fee-status-badge';
import type { ChildWithAssignments } from '@/modules/fees/fee.types';

type SingleInputProps = {
  mode: 'single';
  children: ChildWithAssignments[];
  customAmounts: Record<string, string>;
  onCustomAmountChange: (assignmentId: string, value: string) => void;
  disabled?: boolean;
};

type DualInputProps = {
  mode: 'dual';
  children: ChildWithAssignments[];
  paymentAmounts: Record<string, string>;
  discountAmounts: Record<string, string>;
  onPaymentChange: (assignmentId: string, value: string) => void;
  onDiscountChange: (assignmentId: string, value: string) => void;
  disabled?: boolean;
};

type ReadOnlyProps = {
  mode: 'readonly';
  children: ChildWithAssignments[];
};

type Props = SingleInputProps | DualInputProps | ReadOnlyProps;

export function FamilyChildrenSummary(props: Props) {
  const { children, mode } = props;
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
          {mode === 'dual' && (
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-1 text-xs text-muted-foreground items-center">
              <span className="font-semibold">Month</span>
              <span className="font-semibold text-center w-20">Balance</span>
              <span className="font-semibold text-center w-24">Payment</span>
              <span className="font-semibold text-center w-24">Discount</span>
              {child.assignments.map((a) => (
                <AssignmentDualRow key={a.assignmentId} assignment={a} props={props as DualInputProps} />
              ))}
            </div>
          )}
          {mode === 'single' && (
            <div className="text-xs text-muted-foreground space-y-1">
              {child.assignments.map((a) => (
                <div key={a.assignmentId} className="flex items-center justify-between gap-2">
                  <span className="shrink-0">{formatMonth(a.periodLabel)}</span>
                  <span className="font-mono shrink-0">{formatCurrency(a.balanceAmount)}</span>
                  <Input type="number" min={0} max={a.balanceAmount} placeholder="0"
                    value={(props as SingleInputProps).customAmounts[a.assignmentId] ?? ''}
                    onChange={(e) => (props as SingleInputProps).onCustomAmountChange(a.assignmentId, e.target.value)}
                    className="h-7 w-24 font-mono text-xs" disabled={(props as SingleInputProps).disabled} />
                </div>
              ))}
            </div>
          )}
          {mode === 'readonly' && (
            <div className="text-xs text-muted-foreground space-y-1">
              {child.assignments.map((a) => (
                <div key={a.assignmentId} className="flex justify-between">
                  <span>{formatMonth(a.periodLabel)}</span>
                  <span className="font-mono">{formatCurrency(a.balanceAmount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

function AssignmentDualRow({ assignment: a, props }: {
  assignment: ChildWithAssignments['assignments'][number];
  props: DualInputProps;
}) {
  return (
    <>
      <span>{formatMonth(a.periodLabel)}</span>
      <span className="font-mono text-center">{formatCurrency(a.balanceAmount)}</span>
      <Input type="number" min={0} max={a.balanceAmount} placeholder="0"
        value={props.paymentAmounts[a.assignmentId] ?? ''}
        onChange={(e) => props.onPaymentChange(a.assignmentId, e.target.value)}
        className="h-7 w-24 font-mono text-xs" disabled={props.disabled} />
      <Input type="number" min={0} max={a.balanceAmount} placeholder="0"
        value={props.discountAmounts[a.assignmentId] ?? ''}
        onChange={(e) => props.onDiscountChange(a.assignmentId, e.target.value)}
        className="h-7 w-24 font-mono text-xs text-green-700" disabled={props.disabled} />
    </>
  );
}
