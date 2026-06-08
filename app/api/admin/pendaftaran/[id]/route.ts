import { NextRequest } from 'next/server';
import { jsonResponse } from '@/lib/api-response';
import { getAuthUser } from '@/lib/utils';
import { getPendaftaranByIdForAdmin } from '@/lib/services/pendaftaran';

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

    if (authUser.peran !== 'admin') {
      return jsonResponse(
        {
          success: false,
          message: 'Hanya admin yang dapat mengakses data pendaftaran',
        },
        403,
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

    const pendaftaran = await getPendaftaranByIdForAdmin(pendaftaranId);

    if (!pendaftaran) {
      return jsonResponse(
        {
          success: false,
          message: 'Pendaftaran tidak ditemukan',
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
    console.error('GET_ADMIN_PENDAFTARAN_BY_ID_ERROR:', error);

    return jsonResponse(
      {
        success: false,
        message: 'Terjadi kesalahan pada server',
      },
      500,
    );
  }
}
