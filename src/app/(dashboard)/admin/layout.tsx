import { requireRole } from '@/lib/auth-utils';
import { fetchAdminReferenceData } from '@/modules/settings/reference-actions';
import { AdminShell } from './admin-shell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('ADMIN');
  const referenceResult = await fetchAdminReferenceData();

  return (
    <AdminShell
      user={session.user}
      referenceData={referenceResult.success ? referenceResult.data : undefined}
    >
      {children}
    </AdminShell>
  );
}
