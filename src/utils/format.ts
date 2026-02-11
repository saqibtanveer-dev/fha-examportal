import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

// ============================================
// Date Formatting
// ============================================

export function formatDate(date: Date | string, pattern = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid date';
  return format(d, pattern);
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'dd MMM yyyy, hh:mm a');
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid date';
  return formatDistanceToNow(d, { addSuffix: true });
}

// ============================================
// Duration Formatting
// ============================================

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// Number Formatting
// ============================================

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatMarks(obtained: number, total: number): string {
  return `${obtained}/${total}`;
}

// ============================================
// String Formatting
// ============================================

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
