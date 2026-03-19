import type { SchoolInfo } from '../types/report-types';
import { APP_NAME } from '@/lib/constants';

// ============================================
// Shared helper: build SchoolInfo from Prisma SchoolSettings
// Used by dmc-queries.ts and gazette-queries.ts
// ============================================

type SchoolSettingsRow = {
  schoolName: string;
  schoolLogo: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  reportHeaderText: string | null;
  reportFooterText: string | null;
  principalName: string | null;
  examControllerName: string | null;
  signatureImageUrl: string | null;
};

export function buildSchoolInfo(school: SchoolSettingsRow): SchoolInfo {
  const resolvedName =
    !school.schoolName || school.schoolName.toLowerCase().includes('examcore')
      ? APP_NAME
      : school.schoolName;
  return {
    name: resolvedName,
    logo: school.schoolLogo || '/icon-512x512.png',
    address: school.address,
    phone: school.phone,
    email: school.email,
    website: school.website,
    reportHeaderText: school.reportHeaderText,
    reportFooterText: school.reportFooterText,
    principalName: school.principalName,
    examControllerName: school.examControllerName,
    signatureImageUrl: school.signatureImageUrl,
  };
}
