import { requireRole } from '@/lib/auth-utils';
import { fetchPrincipalReferenceData } from '@/modules/settings/reference-actions';
import { PrincipalShell } from './principal-shell';

export default async function PrincipalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole('PRINCIPAL');
  const referenceResult = await fetchPrincipalReferenceData();

  return (
    <PrincipalShell
      user={session.user}
      referenceData={referenceResult.success ? referenceResult.data : undefined}
    >
      {children}
    </PrincipalShell>
  );
}
