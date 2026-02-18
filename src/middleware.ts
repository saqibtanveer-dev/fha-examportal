import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const LOGIN = '/login';

const roleRouteMap: Record<string, string> = {
  ADMIN: '/admin',
  PRINCIPAL: '/principal',
  TEACHER: '/teacher',
  STUDENT: '/student',
};

/** Routes accessible without authentication */
const publicRoutes = [LOGIN, '/api/auth'];

/** Routes accessible by ANY authenticated user regardless of role */
const sharedAuthRoutes = ['/profile'];

/** API routes that require role-based access control */
const apiRoleRouteMap: Record<string, string[]> = {
  '/api/admin': ['ADMIN'],
  '/api/principal': ['ADMIN', 'PRINCIPAL'],
  '/api/teacher': ['ADMIN', 'TEACHER'],
  '/api/student': ['STUDENT'],
};

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public routes
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
  if (isPublic) return NextResponse.next();

  // If not authenticated => redirect to login
  if (!req.auth?.user) {
    const loginUrl = new URL(LOGIN, req.url);
    // Only set callbackUrl for relative paths to prevent open redirect
    if (pathname.startsWith('/') && !pathname.startsWith('//')) {
      loginUrl.searchParams.set('callbackUrl', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  const { role } = req.auth.user;

  // Root / => redirect to role dashboard
  if (pathname === '/') {
    const dashboard = roleRouteMap[role];
    if (dashboard) return NextResponse.redirect(new URL(dashboard, req.url));
  }

  // Allow shared authenticated routes (profile)
  const isShared = sharedAuthRoutes.some((route) => pathname.startsWith(route));
  if (isShared) return NextResponse.next();

  // API route access control — enforce role-based access for /api/* routes
  if (pathname.startsWith('/api')) {
    // Check specific API role routes
    for (const [prefix, allowedRoles] of Object.entries(apiRoleRouteMap)) {
      if (pathname.startsWith(prefix)) {
        if (!allowedRoles.includes(role)) {
          return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return NextResponse.next();
      }
    }
    // Shared API routes (e.g., /api/notifications) accessible by any authenticated user
    return NextResponse.next();
  }

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
