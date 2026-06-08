import { NextRequest } from 'next/server';
import { StatusPendaftaran } from '@prisma/client';
import { jsonResponse } from '@/lib/api-response';
import { getAuthUser } from '@/lib/utils';
import { getPendaftaranListForAdmin } from '@/lib/services/pendaftaran';

export async function GET(request: NextRequest) {
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

    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.trim() ?? undefined;
    const statusParam = url.searchParams.get('status') ?? undefined;
    const periodeIdParam = url.searchParams.get('periodeId');

    let status: StatusPendaftaran | undefined;
    if (statusParam) {
      const isValidStatus = Object.values(StatusPendaftaran).includes(
        statusParam as StatusPendaftaran,
      );

      if (!isValidStatus) {
        return jsonResponse(
          {
            success: false,
            message: 'Status pendaftaran tidak valid',
          },
          400,
        );
      }

      status = statusParam as StatusPendaftaran;
    }

    let periodeId: bigint | undefined;
    if (periodeIdParam) {
      try {
        periodeId = BigInt(periodeIdParam);
      } catch {
        return jsonResponse(
          {
            success: false,
            message: 'periodeId harus berupa angka yang valid',
          },
          400,
        );
      }
    }

    const pendaftaranList = await getPendaftaranListForAdmin({
      search,
      status,
      periodeId,
    });

    return jsonResponse(
      {
        success: true,
        message: 'Data pendaftaran santri berhasil diambil',
        data: pendaftaranList,
      },
      200,
    );
  } catch (error) {
    console.error('GET_ADMIN_PENDAFTARAN_ERROR:', error);

    return jsonResponse(
      {
        success: false,
        message: 'Terjadi kesalahan pada server',
      },
      500,
    );
  }
}
