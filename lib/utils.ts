// lib/utils.ts
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, verifyToken } from './auth';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

// Get authenticated user from cookies
export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  return payload;
}

// Generate nomor pendaftaran: PSB-YYYY-NNNN
export function generateNomorPendaftaran(number: number): string {
  const tahun = new Date().getFullYear();
  const urutan = String(number).padStart(4, '0');
  return `PSB-${tahun}-${urutan}`;
}

// Format response dengan standardisasi
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
