'use client';

// ============================================
// Family Dashboard — Child Stats Card
// ============================================

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, BookOpenText, BarChart3, GraduationCap } from 'lucide-react';
import { ATTENDANCE_ALERT_THRESHOLD } from '@/modules/family/family.constants';
import type { ChildDashboardStats } from '@/modules/family/family.types';

type Props = {
  child: ChildDashboardStats;
  onClick?: () => void;
};

export function ChildStatsCard({ child, onClick }: Props) {
  const isAttendanceLow = child.attendance.percentage < ATTENDANCE_ALERT_THRESHOLD;

  return (
    <Card
      className={`cursor-pointer transition-shadow hover:shadow-md ${onClick ? '' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{child.studentName}</CardTitle>
          <Badge variant="secondary">
            {child.className} - {child.sectionName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {/* Attendance */}
          <div className="flex items-center gap-2 rounded-lg border p-2">
            <CalendarCheck className={`h-4 w-4 ${isAttendanceLow ? 'text-destructive' : 'text-green-600'}`} />
            <div>
              <p className="text-xs text-muted-foreground">Attendance</p>
              <p className={`text-sm font-semibold ${isAttendanceLow ? 'text-destructive' : ''}`}>
                {child.attendance.percentage}%
              </p>
            </div>
          </div>

          {/* Exams */}
          <div className="flex items-center gap-2 rounded-lg border p-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Avg Score</p>
              <p className="text-sm font-semibold">{child.exams.averagePercentage}%</p>
            </div>
          </div>

          {/* Completed Exams */}
          <div className="flex items-center gap-2 rounded-lg border p-2">
            <GraduationCap className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-xs text-muted-foreground">Exams Done</p>
              <p className="text-sm font-semibold">
                {child.exams.completedExams}/{child.exams.totalExams}
              </p>
            </div>
          </div>

          {/* Diary */}
          <div className="flex items-center gap-2 rounded-lg border p-2">
            <BookOpenText className="h-4 w-4 text-amber-600" />
            <div>
              <p className="text-xs text-muted-foreground">Diary</p>
              <p className="text-sm font-semibold">
                {child.diary.unreadEntries > 0 ? (
                  <span className="text-amber-600">{child.diary.unreadEntries} unread</span>
                ) : (
                  'All read'
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
