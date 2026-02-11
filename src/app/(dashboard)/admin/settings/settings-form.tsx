'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader, Spinner } from '@/components/shared';
import { updateSettingsAction } from '@/modules/settings/settings-actions';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

type Settings = {
  id: string;
  schoolName: string;
  academicYear: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  schoolLogo: string | null;
};

type Props = { settings: Settings };

export function SettingsForm({ settings }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateSettingsAction({
        schoolName: formData.get('schoolName') as string,
        academicYear: formData.get('academicYear') as string,
        address: formData.get('address') as string || undefined,
        phone: formData.get('phone') as string || undefined,
        email: formData.get('email') as string || undefined,
        website: formData.get('website') as string || undefined,
        schoolLogo: formData.get('schoolLogo') as string || undefined,
      });
      if (result.success) {
        toast.success('Settings updated');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Settings"
        description="Configure your school information"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Settings' }]}
      />

      <form action={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input id="schoolName" name="schoolName" defaultValue={settings.schoolName} required disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input id="academicYear" name="academicYear" defaultValue={settings.academicYear} required disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={settings.email ?? ''} disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={settings.phone ?? ''} disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" defaultValue={settings.website ?? ''} disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolLogo">Logo URL</Label>
                <Input id="schoolLogo" name="schoolLogo" defaultValue={settings.schoolLogo ?? ''} disabled={isPending} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" rows={3} defaultValue={settings.address ?? ''} disabled={isPending} />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
