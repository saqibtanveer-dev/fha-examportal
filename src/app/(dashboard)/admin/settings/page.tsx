import { getSchoolSettings } from '@/modules/settings/settings-queries';
import { SettingsForm } from './settings-form';

export default async function AdminSettingsPage() {
  const settings = await getSchoolSettings();
  return <SettingsForm settings={settings} />;
}
