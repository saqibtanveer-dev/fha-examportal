'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  TeacherAnalytics,
  ClassAnalytics,
  SubjectAnalytics,
  PerformanceTrend,
  GradeDistItem,
  StudentPerformance,
} from './analytics-types';
import { OverviewTab } from './tabs/overview-tab';
import { TeachersTab } from './tabs/teachers-tab';
import { ClassesTab } from './tabs/classes-tab';
import { SubjectsTab } from './tabs/subjects-tab';
import { StudentsTab } from './tabs/students-tab';

type Props = {
  teacherAnalytics: TeacherAnalytics[];
  classAnalytics: ClassAnalytics[];
  subjectAnalytics: SubjectAnalytics[];
  performanceTrends: PerformanceTrend[];
  gradeDistribution: GradeDistItem[];
  topStudents: StudentPerformance[];
  bottomStudents: StudentPerformance[];
};

export function AnalyticsClient({
  teacherAnalytics,
  classAnalytics,
  subjectAnalytics,
  performanceTrends,
  gradeDistribution,
  topStudents,
  bottomStudents,
}: Props) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="teachers">Teachers</TabsTrigger>
        <TabsTrigger value="classes">Classes</TabsTrigger>
        <TabsTrigger value="subjects">Subjects</TabsTrigger>
        <TabsTrigger value="students" className="col-span-2 sm:col-span-1">Students</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab
          teacherAnalytics={teacherAnalytics}
          classAnalytics={classAnalytics}
          subjectAnalytics={subjectAnalytics}
          performanceTrends={performanceTrends}
          gradeDistribution={gradeDistribution}
          topStudents={topStudents}
        />
      </TabsContent>

      <TabsContent value="teachers">
        <TeachersTab teacherAnalytics={teacherAnalytics} />
      </TabsContent>

      <TabsContent value="classes">
        <ClassesTab classAnalytics={classAnalytics} />
      </TabsContent>

      <TabsContent value="subjects">
        <SubjectsTab subjectAnalytics={subjectAnalytics} />
      </TabsContent>

      <TabsContent value="students">
        <StudentsTab topStudents={topStudents} bottomStudents={bottomStudents} />
      </TabsContent>
    </Tabs>
  );
}
