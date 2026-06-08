import { NextRequest } from 'next/server';
import { jsonResponse } from '@/lib/api-response';
import { getAuthUser } from '@/lib/utils';
import { getPendaftaranByIdForUser } from '@/lib/services/pendaftaran';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
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

    const paramsValue = await params;
    let pendaftaranId: bigint;

    try {
      pendaftaranId = BigInt(paramsValue.id);
    } catch {
      return jsonResponse(
        {
          success: false,
          message: 'ID pendaftaran tidak valid',
        },
        400,
      );
    }

    const pendaftaran = await getPendaftaranByIdForUser(
      pendaftaranId,
      BigInt(authUser.id),
    );

    if (!pendaftaran) {
      return jsonResponse(
        {
          success: false,
          message: 'Pendaftaran tidak ditemukan atau Anda tidak memiliki akses',
        },
        404,
      );
    }

    return jsonResponse(
      {
        success: true,
        message: 'Detail pendaftaran santri berhasil diambil',
        data: pendaftaran,
      },
      200,
    );
  } catch (error) {
    console.error('GET_PENDAFTARAN_BY_ID_ERROR:', error);

    return jsonResponse(
      {
        success: false,
        message: 'Terjadi kesalahan pada server',
      },
      500,
    );
  }
}
