'use client';

// ============================================
// Family Profile Page — Client Component
// ============================================

import { PageHeader } from '@/components/shared';
import { SkeletonDashboard } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Phone, Briefcase, MapPin } from 'lucide-react';
import { useFamilyProfile } from '@/modules/family/hooks';

export function FamilyProfileClient() {
  const { data, isLoading } = useFamilyProfile();

  if (isLoading) return <SkeletonDashboard />;

  const profile = data?.success ? data.data : null;

  if (!profile) {
    return (
      <div>
        <PageHeader title="Profile" description="Your family profile" />
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Profile not found. Contact admin.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Profile" description="Your family profile information" />

      <div className="space-y-4">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-4 w-4" /> Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField icon={<Heart className="h-4 w-4" />} label="Relationship" value={profile.relationship} />
              {profile.occupation && <ProfileField icon={<Briefcase className="h-4 w-4" />} label="Occupation" value={profile.occupation} />}
              {profile.address && <ProfileField icon={<MapPin className="h-4 w-4" />} label="Address" value={profile.address} />}
              {profile.emergencyPhone && <ProfileField icon={<Phone className="h-4 w-4" />} label="Emergency Phone" value={profile.emergencyPhone} />}
            </div>
          </CardContent>
        </Card>

        {/* Linked Children */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" /> Linked Children ({profile.children.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.children.length === 0 ? (
              <p className="text-muted-foreground">No children linked to your account.</p>
            ) : (
              <div className="space-y-2">
                {profile.children.map((child) => (
                  <div key={child.studentProfileId} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium">{child.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {child.className} - {child.sectionName} | Roll: {child.rollNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{child.relationship}</Badge>
                      {child.isPrimary && <Badge variant="default">Primary</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfileField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
