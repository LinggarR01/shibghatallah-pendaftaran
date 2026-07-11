import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { jsonResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/utils';
import {
  changePasswordSchema,
  getFirstValidationMessage,
} from '@/lib/validations/auth';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return jsonResponse(
        { success: false, message: 'Anda harus login terlebih dahulu.' },
        401,
      );
    }

    const body = await request.json();
    const parsedBody = changePasswordSchema.safeParse(body);

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

    const pengguna = await prisma.pengguna.findUnique({
      where: { id: BigInt(authUser.id) },
      select: { id: true, password: true },
    });

    if (!pengguna) {
      return jsonResponse(
        { success: false, message: 'Anda harus login terlebih dahulu.' },
        401,
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      parsedBody.data.currentPassword,
      pengguna.password,
    );

    if (!isCurrentPasswordValid) {
      return jsonResponse(
        { success: false, message: 'Password lama tidak sesuai.' },
        400,
      );
    }

    const hashedPassword = await bcrypt.hash(parsedBody.data.newPassword, 10);

    await prisma.pengguna.update({
      where: { id: pengguna.id },
      data: { password: hashedPassword },
      select: { id: true },
    });

    return jsonResponse({
      success: true,
      message: 'Password berhasil diubah.',
    });
  } catch (error) {
    console.error('CHANGE_PASSWORD_ERROR:', error);
    return jsonResponse(
      {
        success: false,
        message: 'Gagal mengubah password. Silakan coba lagi.',
      },
      500,
    );
  }
}
