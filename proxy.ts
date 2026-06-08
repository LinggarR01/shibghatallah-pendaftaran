import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  getRoleHomePath,
  isAuthRole,
  verifyToken,
} from '@/lib/auth';

const routeAliases: Record<string, string> = {
  '/login': '/masuk-akun',
  '/register': '/daftar-akun',
  '/admin/dashboard': '/dashboard/admin',
  '/pendaftar/dashboard': '/dashboard/peserta',
};

const authPages = new Set(['/masuk-akun', '/daftar-akun']);

function buildRedirect(request: NextRequest, pathname: string) {
  return NextResponse.redirect(new URL(pathname, request.url));
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/masuk-akun', request.url);
  loginUrl.searchParams.set('next', request.nextUrl.pathname);

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}

function isAdminRoute(pathname: string) {
  return pathname === '/dashboard/admin' || pathname.startsWith('/admin');
}

function isPendaftarRoute(pathname: string) {
  return (
    pathname === '/dashboard/peserta' ||
    pathname.startsWith('/pendaftar') ||
    pathname.startsWith('/pendaftaran-santri')
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const aliasPath = routeAliases[pathname];

  if (aliasPath) {
    return buildRedirect(request, aliasPath);
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const authUser = token ? await verifyToken(token) : null;

  if (authPages.has(pathname) && authUser?.peran && isAuthRole(authUser.peran)) {
    return buildRedirect(request, getRoleHomePath(authUser.peran));
  }

  if (!isAdminRoute(pathname) && !isPendaftarRoute(pathname)) {
    return NextResponse.next();
  }

  if (!authUser?.peran || !isAuthRole(authUser.peran)) {
    return redirectToLogin(request);
  }

  if (isAdminRoute(pathname) && authUser.peran !== 'admin') {
    return buildRedirect(request, getRoleHomePath(authUser.peran));
  }

  if (isPendaftarRoute(pathname) && authUser.peran !== 'pendaftar') {
    return buildRedirect(request, getRoleHomePath(authUser.peran));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/masuk-akun',
    '/daftar-akun',
    '/admin/:path*',
    '/pendaftar/:path*',
    '/pendaftaran-santri/:path*',
    '/dashboard/admin/:path*',
    '/dashboard/peserta/:path*',
  ],
};
