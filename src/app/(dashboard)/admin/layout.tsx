import { requireRole } from '@/lib/auth-utils';
import { AdminShell } from './admin-shell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('ADMIN');

  return <AdminShell user={session.user}>{children}</AdminShell>;
}
