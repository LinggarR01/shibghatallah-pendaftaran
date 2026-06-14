import { NextRequest } from 'next/server';
import { jsonResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/utils';
import { updateRegistrationStatusSchema } from '@/lib/validations/documents';

const allowedTransitions: Record<string, string[]> = {
  draft: ['perlu_revisi', 'ditolak'],
  menunggu_verifikasi: ['diterima', 'ditolak', 'perlu_revisi'],
  dikirim: ['diterima', 'ditolak', 'perlu_revisi'],
  perlu_revisi: ['menunggu_verifikasi', 'diterima', 'ditolak'],
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return jsonResponse(
        { success: false, message: 'Anda harus login terlebih dahulu' },
        401,
      );
    }

    if (authUser.peran !== 'admin') {
      return jsonResponse(
        { success: false, message: 'Hanya admin yang dapat mengubah status' },
        403,
      );
    }

    const body = await request.json();
    const parsedBody = updateRegistrationStatusSchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonResponse(
        {
          success: false,
          message: parsedBody.error.issues[0]?.message ?? 'Data tidak valid',
        },
        400,
      );
    }

    const { id } = await params;
    let registrationId: bigint;

    try {
      registrationId = BigInt(id);
    } catch {
      return jsonResponse(
        { success: false, message: 'ID pendaftaran tidak valid' },
        400,
      );
    }

    const registration = await prisma.pendaftaran.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      return jsonResponse(
        { success: false, message: 'Pendaftaran tidak ditemukan' },
        404,
      );
    }

    const { status, catatanAdmin } = parsedBody.data;
    const allowedTargets = allowedTransitions[registration.status] ?? [];

    if (status !== registration.status && !allowedTargets.includes(status)) {
      return jsonResponse(
        {
          success: false,
          message: `Status ${registration.status} tidak dapat diubah menjadi ${status}`,
        },
        400,
      );
    }

    if (status === 'perlu_revisi' && !catatanAdmin?.trim()) {
      return jsonResponse(
        {
          success: false,
          message: 'Catatan admin wajib diisi saat status PERLU_REVISI',
        },
        400,
      );
    }

    const updatedRegistration = await prisma.pendaftaran.update({
      where: { id: registration.id },
      data: {
        status,
        catatanAdmin: catatanAdmin?.trim() || null,
        diverifikasiPada:
          status === 'diterima' || status === 'ditolak' ? new Date() : null,
      },
      include: {
        pengguna: { select: { nama: true, email: true, noHp: true } },
        profilSantri: true,
        profilOrangTua: true,
        sekolahSebelumnya: true,
        dokumen: true,
      },
    });

    return jsonResponse({
      success: true,
      message: 'Status pendaftaran berhasil diperbarui',
      data: updatedRegistration,
    });
  } catch (error) {
    console.error('UPDATE_REGISTRATION_STATUS_ERROR:', error);
    return jsonResponse(
      { success: false, message: 'Terjadi kesalahan pada server' },
      500,
    );
  }
}
