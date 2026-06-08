// app/api/pendaftaran/[id]/submit/route.ts
import { NextRequest } from 'next/server';
import { jsonResponse } from '@/lib/api-response';
import { getAuthUser } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const paramsValue = await params;
    const pendaftaranId = BigInt(paramsValue.id);

    // Ambil data pendaftaran
    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
    });

    if (!pendaftaran) {
      return jsonResponse(
        {
          success: false,
          message: 'Pendaftaran tidak ditemukan',
        },
        404,
      );
    }

    // Validasi hanya pemilik pendaftaran yang boleh submit
    if (pendaftaran.penggunaId !== BigInt(authUser.id)) {
      return jsonResponse(
        {
          success: false,
          message: 'Anda tidak memiliki akses untuk mengubah pendaftaran ini',
        },
        403,
      );
    }

    // Validasi status pendaftaran harus draft atau perlu_revisi
    if (
      pendaftaran.status !== 'draft' &&
      pendaftaran.status !== 'perlu_revisi'
    ) {
      return jsonResponse(
        {
          success: false,
          message: `Pendaftaran dengan status ${pendaftaran.status} tidak dapat disubmit`,
        },
        400,
      );
    }

    // Update pendaftaran: ubah status menjadi menunggu_verifikasi dan isi dikirimPada
    const updatedPendaftaran = await prisma.pendaftaran.update({
      where: { id: pendaftaranId },
      data: {
        status: 'menunggu_verifikasi',
        dikirimPada: new Date(),
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
            diunggahPada: true,
          },
        },
      },
    });

    return jsonResponse(
      {
        success: true,
        message: 'Pendaftaran berhasil disubmit',
        data: updatedPendaftaran,
      },
      200,
    );
  } catch (error) {
    console.error('SUBMIT_PENDAFTARAN_ERROR:', error);

    return jsonResponse(
      {
        success: false,
        message: 'Terjadi kesalahan pada server',
      },
      500,
    );
  }
}
