// app/api/pendaftaran/me/route.ts
import { jsonResponse } from '@/lib/api-response';
import { getAuthUser } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Ambil user yang terautentikasi
    const authUser = await getAuthUser();

    if (!authUser) {
      return jsonResponse(
        {
          success: false,
          message: 'Anda harus login terlebih dahulu',
        },
        401,
      );
    }

    // Ambil semua pendaftaran milik user yang sedang login
    const pendaftaranList = await prisma.pendaftaran.findMany({
      where: {
        penggunaId: BigInt(authUser.id),
      },
      include: {
        periode: true,
        profilSantri: true,
        profilOrangTua: true,
        dokumen: {
          select: {
            id: true,
            jenisDokumen: true,
            namaFile: true,
            statusVerifikasi: true,
            catatanAdmin: true,
            diunggahPada: true,
          },
        },
      },
      orderBy: {
        dibuatPada: 'desc',
      },
    });

    return jsonResponse(
      {
        success: true,
        message: 'Data pendaftaran berhasil diambil',
        data: pendaftaranList,
      },
      200,
    );
  } catch (error) {
    console.error('GET_PENDAFTARAN_ME_ERROR:', error);

    return jsonResponse(
      {
        success: false,
        message: 'Terjadi kesalahan pada server',
      },
      500,
    );
  }
}
