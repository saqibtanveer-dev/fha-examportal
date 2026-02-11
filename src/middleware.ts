import { auth } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';
import { NextResponse } from 'next/server';

const publicRoutes = [ROUTES.LOGIN, '/api/auth'];
const roleRouteMap: Record<string, string> = {
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
};

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public routes
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
  if (isPublic) return NextResponse.next();

  // If not authenticated => redirect to login
  if (!req.auth?.user) {
    const loginUrl = new URL(ROUTES.LOGIN, req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { role } = req.auth.user;

  // Root / => redirect to role dashboard
  if (pathname === '/') {
    const dashboard = ROUTES.DASHBOARD[role as keyof typeof ROUTES.DASHBOARD];
    return NextResponse.redirect(new URL(dashboard, req.url));
  }

  // Enforce role-based route access
  const allowedPrefix = roleRouteMap[role];
  if (allowedPrefix && !pathname.startsWith(allowedPrefix) && !pathname.startsWith('/api')) {
    const dashboard = ROUTES.DASHBOARD[role as keyof typeof ROUTES.DASHBOARD];
    return NextResponse.redirect(new URL(dashboard, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
