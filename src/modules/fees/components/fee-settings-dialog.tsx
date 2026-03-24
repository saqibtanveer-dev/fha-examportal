'use client';

import { useTransition } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/shared';
import { updateFeeSettingsAction } from '@/modules/fees/fee-settings-actions';
import { toast } from 'sonner';
import type { SerializedFeeSettings } from '@/modules/fees/fee.types';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: SerializedFeeSettings | null;
};

export function FeeSettingsDialog({ open, onOpenChange, settings }: Props) {
  const [isPending, startTransition] = useTransition();
  const invalidate = useInvalidateCache();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateFeeSettingsAction({
        dueDayOfMonth: Number(formData.get('dueDayOfMonth') || 10),
        lateFeePerDay: Number(formData.get('lateFeePerDay') || 0),
        maxLateFee: Number(formData.get('maxLateFee') || 0),
        receiptPrefix: (formData.get('receiptPrefix') as string) || 'FRCP',
        familyReceiptPrefix: (formData.get('familyReceiptPrefix') as string) || 'FMRC',
        gracePeriodDays: Number(formData.get('gracePeriodDays') || 0),
        autoApplyCreditsOnGeneration: formData.get('autoApplyCreditsOnGeneration') === 'on',
      });

      if (result.success) {
        toast.success('Fee settings updated');
        onOpenChange(false);
        await invalidate.feeSettings();
      } else {
        toast.error(result.error ?? 'Failed to update settings');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Fee Settings</DialogTitle>
          <DialogDescription>Configure defaults for the current academic session.</DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dueDayOfMonth">Due Day of Month</Label>
              <Input
                id="dueDayOfMonth"
                name="dueDayOfMonth"
                type="number"
                min={1}
                max={28}
                defaultValue={settings?.dueDayOfMonth ?? 10}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gracePeriodDays">Grace Period (days)</Label>
              <Input
                id="gracePeriodDays"
                name="gracePeriodDays"
                type="number"
                min={0}
                max={30}
                defaultValue={settings?.gracePeriodDays ?? 0}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lateFeePerDay">Late Fee / Day (PKR)</Label>
              <Input
                id="lateFeePerDay"
                name="lateFeePerDay"
                type="number"
                min={0}
                step={1}
                defaultValue={settings?.lateFeePerDay ?? 0}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxLateFee">Max Late Fee (PKR)</Label>
              <Input
                id="maxLateFee"
                name="maxLateFee"
                type="number"
                min={0}
                step={1}
                defaultValue={settings?.maxLateFee ?? 0}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiptPrefix">Receipt Prefix</Label>
              <Input
                id="receiptPrefix"
                name="receiptPrefix"
                defaultValue={settings?.receiptPrefix ?? 'FRCP'}
                maxLength={10}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyReceiptPrefix">Family Receipt Prefix</Label>
              <Input
                id="familyReceiptPrefix"
                name="familyReceiptPrefix"
                defaultValue={settings?.familyReceiptPrefix ?? 'FMRC'}
                maxLength={10}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label htmlFor="autoApplyCreditsOnGeneration">Auto Apply Credits On Generation</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    If off, credits stay available and admin can apply them manually during collection.
                  </p>
                </div>
                <Switch
                  id="autoApplyCreditsOnGeneration"
                  name="autoApplyCreditsOnGeneration"
                  defaultChecked={settings?.autoApplyCreditsOnGeneration ?? true}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner size="sm" className="mr-2" />}Save Settings
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
