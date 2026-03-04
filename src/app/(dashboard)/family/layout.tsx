import { requireRole } from '@/lib/auth-utils';
import { FamilyShell } from './family-shell';

export default async function FamilyLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('FAMILY');

  return (
    <FamilyShell user={session.user}>
      {children}
    </FamilyShell>
  );
}
