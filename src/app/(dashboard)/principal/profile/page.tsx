import { requireRole } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ProfilePageClient } from '@/modules/users/components/profile-page-client';

export default async function PrincipalProfilePage() {
  const session = await requireRole('PRINCIPAL');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) redirect('/login');

  return <ProfilePageClient user={user} />;
}
