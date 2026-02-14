export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/auth-utils';
import { PageHeader } from '@/components/shared';
import { getClassesList } from '@/modules/principal/principal-queries';
import { ClassesListClient } from './classes-list-client';

export default async function PrincipalClassesPage() {
  await requireRole('PRINCIPAL');
  const classes = await getClassesList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="Class-wise overview with student counts and performance metrics"
      />
      <ClassesListClient classes={classes} />
    </div>
  );
}
