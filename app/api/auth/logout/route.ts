// app/api/auth/logout/route.ts
import { jsonResponse } from '@/lib/api-response';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const response = jsonResponse(
    {
      success: true,
      message: 'Logout berhasil',
    },
    200,
  );

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
