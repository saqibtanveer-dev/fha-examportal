import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const LOGIN = '/login';

const roleRouteMap: Record<string, string> = {
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
};

/** Routes accessible without authentication */
const publicRoutes = [LOGIN, '/api/auth'];

/** Routes accessible by ANY authenticated user regardless of role */
const sharedAuthRoutes = ['/profile', '/api'];

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public routes
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
  if (isPublic) return NextResponse.next();

  // If not authenticated => redirect to login
  if (!req.auth?.user) {
    const loginUrl = new URL(LOGIN, req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { role } = req.auth.user;

  // Root / => redirect to role dashboard
  if (pathname === '/') {
    const dashboard = roleRouteMap[role];
    if (dashboard) return NextResponse.redirect(new URL(dashboard, req.url));
  }

  // Allow shared authenticated routes (profile, API)
  const isShared = sharedAuthRoutes.some((route) => pathname.startsWith(route));
  if (isShared) return NextResponse.next();

  // Enforce role-based route access
  const allowedPrefix = roleRouteMap[role];
  if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
    return NextResponse.redirect(new URL(allowedPrefix, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
