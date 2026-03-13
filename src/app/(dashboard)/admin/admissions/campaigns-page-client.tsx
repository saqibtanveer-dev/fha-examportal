'use client';

import { useCampaignsQuery } from '@/modules/admissions/hooks/use-admissions-query';
import { CampaignsListSkeleton } from './admissions-skeleton';
import { CampaignsView } from './campaigns-view';
import { useQuery } from '@tanstack/react-query';
import { fetchClassesAction } from '@/modules/classes/class-fetch-actions';
import { fetchAcademicSessionsForSelectAction } from '@/modules/academic-sessions/session-fetch-actions';
import { queryKeys } from '@/lib/query-keys';

export function CampaignsPageClient() {
  const { data, isLoading } = useCampaignsQuery(
    { page: 1, pageSize: 50 },
    {},
  );

  const { data: classesRaw } = useQuery({
    queryKey: queryKeys.classes.forSelect(),
    queryFn: fetchClassesAction,
  });

  const { data: sessionsRaw } = useQuery({
    queryKey: queryKeys.academicSessions.forSelect(),
    queryFn: fetchAcademicSessionsForSelectAction,
  });

  if (isLoading || !data) return <CampaignsListSkeleton />;

  const campaigns = data.success && data.data ? data.data.data ?? [] : [];

  const classes = (classesRaw ?? []).map((c) => ({ id: c.id, name: c.name }));
  const academicSessions = (sessionsRaw ?? []).map((s) => ({ id: s.id, name: s.name }));

  return <CampaignsView campaigns={campaigns} classes={classes} academicSessions={academicSessions} />;
}
