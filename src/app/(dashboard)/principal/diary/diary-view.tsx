'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader, EmptyState, Spinner } from '@/components/shared';
import {
  DiaryStatsCards,
  DiaryMissingList,
  DiaryCoverageMatrix,
  DiaryEntryCard,
  DiaryFiltersBar,
} from '@/modules/diary/components';
import {
  useDiaryStats,
  useDiaryCoverage,
  useAllDiaryEntries,
} from '@/modules/diary/hooks';
import { getMonthRange, formatDiaryDate } from '@/modules/diary/diary.utils';
import { groupEntriesByDate } from '@/modules/diary/diary.utils';
import type { DiaryFilters, DiaryEntryRecord } from '@/modules/diary/diary.types';
import type { RefClass } from '@/stores';

type Props = {
  classes: RefClass[];
  currentSessionId: string;
};

export function PrincipalDiaryView({ classes, currentSessionId }: Props) {
  const now = new Date();
  const monthRange = getMonthRange(now.getFullYear(), now.getMonth() + 1);

  // Stats & Coverage date range
  const [statsStart, setStatsStart] = useState(monthRange.startDate);
  const [statsEnd, setStatsEnd] = useState(monthRange.endDate);
  const [coverageClassId, setCoverageClassId] = useState<string | undefined>();

  // Browse entries filters
  const [browseFilters, setBrowseFilters] = useState<DiaryFilters>({});

  const { data: stats, isLoading: statsLoading } = useDiaryStats(statsStart, statsEnd);
  const { data: coverage, isLoading: coverageLoading } = useDiaryCoverage(statsStart, statsEnd, coverageClassId);
  const { data: allEntries, isLoading: entriesLoading } = useAllDiaryEntries(browseFilters);

  const groupedEntries = useMemo(() => {
    if (!allEntries?.length) return [];
    return Array.from(groupEntriesByDate(allEntries as DiaryEntryRecord[]).entries());
  }, [allEntries]);

  // Derive subjects from classes for filters
  const subjects = useMemo(() => {
    const map = new Map<string, { id: string; name: string; code: string }>();
    for (const cls of classes) {
      const clsWithSubjects = cls as RefClass & { subjects?: { id: string; name: string; code: string }[] };
      if (clsWithSubjects.subjects?.length) {
        for (const s of clsWithSubjects.subjects) {
          if (!map.has(s.id)) map.set(s.id, s);
        }
      }
    }
    return Array.from(map.values());
  }, [classes]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Diary Monitoring"
        description="Monitor teacher diary entries, track compliance, and add notes."
        breadcrumbs={[
          { label: 'Principal', href: '/principal' },
          { label: 'Diary' },
        ]}
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="coverage">Coverage Matrix</TabsTrigger>
          <TabsTrigger value="browse">Browse Entries</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">From</Label>
              <Input type="date" value={statsStart} onChange={(e) => setStatsStart(e.target.value)} className="h-9 w-36" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To</Label>
              <Input type="date" value={statsEnd} onChange={(e) => setStatsEnd(e.target.value)} className="h-9 w-36" />
            </div>
          </div>

          {statsLoading ? (
            <div className="flex justify-center py-8"><Spinner size="lg" /></div>
          ) : stats ? (
            <>
              <DiaryStatsCards stats={stats} />
              {stats.missingToday?.length > 0 && (
                <DiaryMissingList items={stats.missingToday} />
              )}
            </>
          ) : (
            <EmptyState title="No Data" description="No diary statistics available for the selected range." />
          )}
        </TabsContent>

        {/* Coverage Matrix Tab */}
        <TabsContent value="coverage" className="space-y-4 mt-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">From</Label>
              <Input type="date" value={statsStart} onChange={(e) => setStatsStart(e.target.value)} className="h-9 w-36" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To</Label>
              <Input type="date" value={statsEnd} onChange={(e) => setStatsEnd(e.target.value)} className="h-9 w-36" />
            </div>
            {classes.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs">Class (Optional)</Label>
                <select
                  value={coverageClassId ?? ''}
                  onChange={(e) => setCoverageClassId(e.target.value || undefined)}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">All Classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {coverageLoading ? (
            <div className="flex justify-center py-8"><Spinner size="lg" /></div>
          ) : coverage ? (
            <DiaryCoverageMatrix data={coverage} />
          ) : (
            <EmptyState title="No Coverage Data" description="No coverage data available for the selected range." />
          )}
        </TabsContent>

        {/* Browse Entries Tab */}
        <TabsContent value="browse" className="space-y-4 mt-4">
          <DiaryFiltersBar
            filters={browseFilters}
            onFiltersChange={setBrowseFilters}
            classes={classes}
            subjects={subjects}
            showStatusFilter
          />

          {entriesLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : groupedEntries.length === 0 ? (
            <EmptyState title="No diary entries" description="No entries match the selected filters." />
          ) : (
            <div className="space-y-6">
              {groupedEntries.map(([dateStr, dayEntries]) => (
                <div key={dateStr}>
                  <h3 className="sticky top-0 z-10 mb-3 rounded-md bg-muted/80 px-3 py-1.5 text-sm font-semibold backdrop-blur-sm">
                    {formatDiaryDate(dateStr)}
                  </h3>
                  <div className="space-y-3">
                    {(dayEntries as DiaryEntryRecord[]).map((entry) => (
                      <DiaryEntryCard
                        key={entry.id}
                        entry={entry}
                        showTeacher
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
