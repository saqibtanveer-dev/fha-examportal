/**
 * Email generation utilities.
 * Generates role-scoped email addresses from first + last name.
 * Domain is controlled by NEXT_PUBLIC_EMAIL_DOMAIN env var (default: fhsc.edu.pk).
 */

const ROLE_SUBDOMAIN: Record<string, string> = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
  PRINCIPAL: 'principal',
  FAMILY: 'family',
  CANDIDATE: 'candidate',
};

function sanitizeEmailPart(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '');
}

/**
 * Generates a role-scoped email from firstName + lastName.
 * Pattern: firstname.lastname@<role-subdomain>.<NEXT_PUBLIC_EMAIL_DOMAIN>
 * e.g. ali.raza@student.fhsc.edu.pk
 */
export function generateEmailFromName(
  firstName: string,
  lastName: string,
  role: string,
): string {
  const domain =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_EMAIL_DOMAIN) ||
    'fhsc.edu.pk';
  const subdomain = ROLE_SUBDOMAIN[role.toUpperCase()] ?? 'user';
  const first = sanitizeEmailPart(firstName);
  const last = sanitizeEmailPart(lastName);
  if (!first && !last) return '';
  const localPart = [first, last].filter(Boolean).join('.');
  return `${localPart}@${subdomain}.${domain}`;
}

/**
 * Returns the email domain string for display purposes.
 * e.g. "@student.fhsc.edu.pk"
 */
export function getEmailSuffix(role: string): string {
  const domain =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_EMAIL_DOMAIN) ||
    'fhsc.edu.pk';
  const subdomain = ROLE_SUBDOMAIN[role.toUpperCase()] ?? 'user';
  return `@${subdomain}.${domain}`;
}
