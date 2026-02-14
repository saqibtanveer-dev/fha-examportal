'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared';
import { formatDate } from '@/utils/format';
import { KeyRound, Mail, Phone, Shield, User } from 'lucide-react';

type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
};

export function ProfilePageClient({ user }: { user: UserProfile }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="View your account details"
        breadcrumbs={[{ label: 'Profile' }]}
        actions={
          <Link href="profile/change-password">
            <Button variant="outline">
              <KeyRound className="mr-2 h-4 w-4" />
              Change Password
            </Button>
          </Link>
        }
      />

      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Row icon={<User className="h-4 w-4" />} label="Name" value={`${user.firstName} ${user.lastName}`} />
          <Row icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
          <Row icon={<Phone className="h-4 w-4" />} label="Phone" value={user.phone ?? 'Not set'} />
          <Row
            icon={<Shield className="h-4 w-4" />}
            label="Role"
            value={<Badge variant="secondary">{user.role}</Badge>}
          />
          <Row label="Status" value={
            <Badge variant={user.isActive ? 'default' : 'destructive'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          } />
          <Row label="Member Since" value={formatDate(user.createdAt)} />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="min-w-0 truncate text-sm font-medium">{value}</div>
    </div>
  );
}
