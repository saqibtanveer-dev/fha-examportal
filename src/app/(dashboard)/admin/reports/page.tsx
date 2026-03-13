import Link from 'next/link';
import { PageHeader } from '@/components/shared';
import { requireRole } from '@/lib/auth-utils';
import { ReportsPageClient } from '@/modules/results/components/reports-page-client';
import {
  getSystemOverview,
  getDepartmentPerformance,
  getSubjectPerformance,
  getRecentExamSummaries,
  getGradeDistribution,
} from '@/modules/results/report-queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, TrendingUp, FileText, Table2, MessageSquare } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export const metadata = { title: 'Reports & Analytics' };

const reportSections = [
  {
    title: 'Result Terms',
    description: 'Configure exam groups, weights and link exams for consolidation',
    href: ROUTES.ADMIN.REPORTS_RESULT_TERMS,
    icon: ClipboardList,
  },
  {
    title: 'Consolidation',
    description: 'Compute and publish consolidated results for a class',
    href: ROUTES.ADMIN.REPORTS_CONSOLIDATION,
    icon: TrendingUp,
  },
  {
    title: 'DMC Generator',
    description: 'Generate and print Detailed Marks Certificates per student or section',
    href: ROUTES.ADMIN.REPORTS_DMC,
    icon: FileText,
  },
  {
    title: 'Class Gazette',
    description: 'View and print the full class tabulation sheet',
    href: ROUTES.ADMIN.REPORTS_GAZETTE,
    icon: Table2,
  },
  {
    title: 'Student Remarks',
    description: 'Add class teacher and principal remarks to student DMCs',
    href: ROUTES.ADMIN.REPORTS_REMARKS,
    icon: MessageSquare,
  },
];

const OVERVIEW_FALLBACK = {
  totalStudents: 0, totalTeachers: 0, totalExams: 0, totalResults: 0,
  totalDepartments: 0, totalSubjects: 0, overallPassRate: 0, overallAvgPercentage: 0,
};

export default async function AdminReportsPage() {
  await requireRole('ADMIN');

  // Use individual .catch() fallbacks — a P1001 on one query must not crash the whole page
  const [overview, departments, subjects, recentExams, gradeDistribution] =
    await Promise.all([
      getSystemOverview().catch(() => OVERVIEW_FALLBACK),
      getDepartmentPerformance().catch(() => [] as Awaited<ReturnType<typeof getDepartmentPerformance>>),
      getSubjectPerformance().catch(() => [] as Awaited<ReturnType<typeof getSubjectPerformance>>),
      getRecentExamSummaries().catch(() => [] as Awaited<ReturnType<typeof getRecentExamSummaries>>),
      getGradeDistribution().catch(() => [] as Awaited<ReturnType<typeof getGradeDistribution>>),
    ]);

  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        description="System-wide performance metrics, DMC generation, and print reports"
      />

      {/* Report System Quick Access */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reportSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full transition-colors hover:border-primary hover:bg-accent/30 cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <section.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{section.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <ReportsPageClient
        overview={overview}
        departments={departments}
        subjects={subjects}
        recentExams={recentExams}
        gradeDistribution={gradeDistribution}
      />
    </>
  );
}
