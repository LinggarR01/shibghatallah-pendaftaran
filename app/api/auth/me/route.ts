// app/api/auth/me/route.ts
import { jsonResponse } from '@/lib/api-response';
import { getAuthUser } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Ambil user yang terautentikasi dari token
    const authUser = await getAuthUser();

    if (!authUser) {
      return jsonResponse(
        {
          success: false,
          message: 'Token tidak valid atau sudah kadaluarsa',
        },
        401,
      );
    }

    // Ambil data user terbaru dari database
    const user = await prisma.pengguna.findUnique({
      where: { id: BigInt(authUser.id) },
      select: {
        id: true,
        nama: true,
        email: true,
        noHp: true,
        peran: true,
        dibuatPada: true,
        diperbaruiPada: true,
      },
    });

    if (!user) {
      return jsonResponse(
        {
          success: false,
          message: 'User tidak ditemukan',
        },
        404,
      );
    }

    return jsonResponse(
      {
        success: true,
        message: 'Data user berhasil diambil',
        data: user,
      },
      200,
    );
  } catch (error) {
    console.error('GET_ME_ERROR:', error);

    return jsonResponse(
      {
        success: false,
        message: 'Terjadi kesalahan pada server',
      },
      500,
    );
  }
}
