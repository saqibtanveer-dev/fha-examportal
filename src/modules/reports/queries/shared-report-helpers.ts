import type { SchoolInfo } from '../types/report-types';

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
  return {
    name: school.schoolName,
    logo: school.schoolLogo,
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
