'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Target, Clock, ShieldAlert } from 'lucide-react';
import type { ExamDetailedAnalytics } from '@/modules/results/result-queries';
import { ScoreOverview } from './analytics/score-overview';
import { QuestionAccuracyChart, DifficultyDiscriminationChart, McqOptionBreakdown, QuestionRadarChart } from './analytics/question-charts';
import { QuestionPerformanceTable } from './analytics/question-performance-table';
import { TimeAnalytics, AntiCheatSummary } from './analytics/time-integrity-section';

type Props = { analytics: ExamDetailedAnalytics };

export function ExamDetailedAnalyticsDashboard({ analytics }: Props) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="flex-wrap">
        <TabsTrigger value="overview" className="gap-1.5">
          <BarChart3 className="h-3.5 w-3.5" /> Overview
        </TabsTrigger>
        <TabsTrigger value="questions" className="gap-1.5">
          <Target className="h-3.5 w-3.5" /> Questions
        </TabsTrigger>
        <TabsTrigger value="time" className="gap-1.5">
          <Clock className="h-3.5 w-3.5" /> Time
        </TabsTrigger>
        <TabsTrigger value="integrity" className="gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5" /> Integrity
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <ScoreOverview data={analytics} />
      </TabsContent>

      <TabsContent value="questions" className="space-y-4">
        <QuestionAccuracyChart questions={analytics.questions} />
        <div className="grid gap-4 lg:grid-cols-2">
          <DifficultyDiscriminationChart questions={analytics.questions} />
          <QuestionRadarChart questions={analytics.questions} />
        </div>
        <McqOptionBreakdown questions={analytics.questions} />
        <QuestionPerformanceTable questions={analytics.questions} />
      </TabsContent>

      <TabsContent value="time" className="space-y-4">
        <TimeAnalytics data={analytics} />
      </TabsContent>

      <TabsContent value="integrity" className="space-y-4">
        <AntiCheatSummary data={analytics} />
      </TabsContent>
    </Tabs>
  );
}
