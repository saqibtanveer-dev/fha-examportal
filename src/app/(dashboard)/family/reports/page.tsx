import { requireRole } from '@/lib/auth-utils';
import { PageHeader } from '@/components/shared';
import { prisma } from '@/lib/prisma';
import { FamilyReportsClient } from '@/modules/reports/components/screens/family-reports-client';

export const metadata = { title: "Children's Reports" };

async function getChildren(userId: string) {
  const links = await prisma.familyStudentLink.findMany({
    where: { familyProfile: { userId }, isActive: true },
    include: {
      studentProfile: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          class: { select: { name: true } },
          section: { select: { name: true } },
        },
      },
    },
  });
  return links.map((l) => ({
    studentId: l.studentProfile.userId,
    name: `${l.studentProfile.user.firstName} ${l.studentProfile.user.lastName}`,
    className: l.studentProfile.class.name,
    sectionName: l.studentProfile.section.name,
    rollNumber: l.studentProfile.rollNumber,
    classId: l.studentProfile.classId,
  }));
}

export default async function FamilyReportsPage() {
  const session = await requireRole('FAMILY');
  const children = await getChildren(session.user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Children's Reports"
        description="View and print your children's Detailed Marks Certificates"
      />
      <FamilyReportsClient children={children} />
    </div>
  );
}
