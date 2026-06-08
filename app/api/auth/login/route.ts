// app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { jsonResponse } from '@/lib/api-response';
import {
  AUTH_COOKIE_NAME,
  AUTH_MAX_AGE,
  createToken,
  getRoleHomePath,
  normalizeAuthRole,
} from '@/lib/auth';
import { getFirstValidationMessage, loginSchema } from '@/lib/validations/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedBody = loginSchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonResponse(
        {
          success: false,
          message: getFirstValidationMessage(parsedBody.error),
          errors: parsedBody.error.flatten().fieldErrors,
        },
        400,
      );
    }

    const { email, password } = parsedBody.data;

    // Cari user berdasarkan email
    const pengguna = await prisma.pengguna.findUnique({
      where: { email },
    });

    if (!pengguna) {
      return jsonResponse(
        {
          success: false,
          message: 'Email atau password salah',
        },
        401,
      );
    }

    // Bandingkan password
    const isPasswordValid = await bcrypt.compare(password, pengguna.password);

    if (!isPasswordValid) {
      return jsonResponse(
        {
          success: false,
          message: 'Email atau password salah',
        },
        401,
      );
    }

    // Normalisasi role dan validasi
    const role = normalizeAuthRole(pengguna.peran);

    if (!role) {
      return jsonResponse(
        {
          success: false,
          message: 'Role pengguna tidak valid',
        },
        403,
      );
    }

    // Buat JWT token
    const token = await createToken({
      id: pengguna.id.toString(),
      nama: pengguna.nama,
      email: pengguna.email,
      peran: role,
    });

    // Buat response dan set cookie
    const response = jsonResponse(
      {
        success: true,
        message: 'Login berhasil',
        data: {
          id: pengguna.id.toString(),
          nama: pengguna.nama,
          email: pengguna.email,
          noHp: pengguna.noHp,
          peran: role,
          redirectTo: getRoleHomePath(pengguna.peran),
        },
      },
      200,
    );

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: AUTH_MAX_AGE,
      path: '/',
    });

    console.log('Role dari database:', pengguna.peran);
    console.log('Redirect:', getRoleHomePath(pengguna.peran));

    return response;
  } catch (error) {
    console.error('LOGIN_ERROR:', error);

    return jsonResponse(
      {
        success: false,
        message: 'Terjadi kesalahan pada server',
      },
      500,
    );
  }
}
