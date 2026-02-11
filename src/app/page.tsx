import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

/**
 * Root page — middleware handles role-based redirects for authenticated users.
 * This page is only reachable in edge cases; redirect to login as fallback.
 */
export default function Home() {
  redirect(ROUTES.LOGIN);
}
