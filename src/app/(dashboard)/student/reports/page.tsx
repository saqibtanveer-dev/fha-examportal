import { requireRole } from '@/lib/auth-utils';
import { PageHeader } from '@/components/shared';
import { getPublishedResultTermsForStudentAction } from '@/modules/reports/actions/result-term-fetch-actions';
import { StudentReportsClient } from '@/modules/reports/components/screens/student-reports-client';

export const metadata = { title: 'My Reports' };

export default async function StudentReportsPage() {
  const session = await requireRole('STUDENT');

  let terms: Awaited<ReturnType<typeof getPublishedResultTermsForStudentAction>> = [];
  try {
    terms = await getPublishedResultTermsForStudentAction(session.user.id);
  } catch {
    // DB temporarily unreachable — client component will show empty state
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Reports"
        description="View and print your Detailed Marks Certificates"
      />
      <StudentReportsClient studentId={session.user.id} terms={terms} />
    </div>
  );
}
