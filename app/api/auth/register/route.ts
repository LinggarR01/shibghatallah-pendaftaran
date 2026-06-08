// app/api/auth/register/route.ts
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { jsonResponse } from '@/lib/api-response';
import {
  AUTH_COOKIE_NAME,
  AUTH_MAX_AGE,
  createToken,
  getAfterRegisterPath,
  normalizeAuthRole,
} from '@/lib/auth';
import {
  getFirstValidationMessage,
  registerSchema,
} from '@/lib/validations/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedBody = registerSchema.safeParse(body);

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

    const { nama, email, noHp, password } = parsedBody.data;

    // Cek email sudah terdaftar
    const existingUser = await prisma.pengguna.findUnique({
      where: { email },
    });

    if (existingUser) {
      return jsonResponse(
        {
          success: false,
          message: 'Email sudah terdaftar',
        },
        400,
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const newUser = await prisma.pengguna.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        noHp,
        peran: 'pendaftar',
      },
      select: {
        id: true,
        nama: true,
        email: true,
        noHp: true,
        peran: true,
        dibuatPada: true,
      },
    });

    const role = normalizeAuthRole(newUser.peran);

    const token = await createToken({
      id: newUser.id.toString(),
      nama: newUser.nama,
      email: newUser.email,
      peran: newUser.peran,
    });

    const response = jsonResponse(
      {
        success: true,
        message: 'Registrasi berhasil',
        data: {
          ...newUser,
          id: newUser.id.toString(),
          redirectTo: getAfterRegisterPath(role),
        },
      },
      201,
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

    return response;
  } catch (error) {
    console.error('REGISTER_ERROR:', error);

    return jsonResponse(
      {
        success: false,
        message: 'Terjadi kesalahan pada server',
      },
      500,
    );
  }
}
