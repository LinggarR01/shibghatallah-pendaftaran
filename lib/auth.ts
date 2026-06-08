// lib/auth.ts
import { jwtVerify, SignJWT } from 'jose';

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('JWT_SECRET belum diatur di file .env');
}

const encodedSecret = new TextEncoder().encode(secret);

export const AUTH_COOKIE_NAME = 'token';
export const AUTH_MAX_AGE = 60 * 60;
export const AUTH_EXPIRES_IN = '1d';

export type AuthRole = 'admin' | 'pendaftar';

export type AuthPayload = {
  id: string;
  nama: string;
  email: string;
  peran: AuthRole;
};

export function normalizeAuthRole(value: unknown): AuthRole | null {
  if (typeof value !== 'string') return null;

  const role = value.toLowerCase();

  if (role === 'admin') return 'admin';
  if (role === 'pendaftar') return 'pendaftar';

  return null;
}

export async function createToken(payload: AuthPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(AUTH_EXPIRES_IN)
    .sign(encodedSecret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    const role = normalizeAuthRole(payload.peran);

    if (
      typeof payload.id !== 'string' ||
      typeof payload.nama !== 'string' ||
      typeof payload.email !== 'string' ||
      !role
    ) {
      return null;
    }

    return {
      id: payload.id,
      nama: payload.nama,
      email: payload.email,
      peran: role,
    };
  } catch {
    return null;
  }
}

export function getRoleHomePath(role: unknown) {
  const normalizedRole = normalizeAuthRole(role);

  if (normalizedRole === 'admin') return '/dashboard/admin';
  if (normalizedRole === 'pendaftar') return '/dashboard/peserta';

  return '/masuk-akun';
}

// khusus setelah register
export function getAfterRegisterPath(role: unknown) {
  const normalizedRole = normalizeAuthRole(role);

  if (normalizedRole === 'admin') return '/dashboard/admin';
  if (normalizedRole === 'pendaftar') return '/pendaftar/formulir';

  return '/masuk-akun';
}

export function isAuthRole(value: unknown): value is AuthRole {
  return value === 'admin' || value === 'pendaftar';
}
