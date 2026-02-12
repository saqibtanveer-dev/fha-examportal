export const dynamic = 'force-dynamic';

import { getSchoolSettings } from '@/modules/settings/settings-queries';
import { listAcademicSessions } from '@/modules/academic-sessions/session-queries';
import { SettingsForm } from './settings-form';
import { AcademicSessionManager } from '@/modules/academic-sessions/components/academic-session-manager';

export default async function AdminSettingsPage() {
  const [settings, academicSessions] = await Promise.all([
    getSchoolSettings(),
    listAcademicSessions(),
  ]);

  return (
    <div className="space-y-8">
      <SettingsForm settings={settings} />
      <AcademicSessionManager sessions={academicSessions} />
    </div>
  );
}
