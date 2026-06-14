import path from 'node:path';
import { unlink } from 'node:fs/promises';
import { jsonResponse } from '@/lib/api-response';
import { documentStorageRoot } from '@/lib/documents';
import { prisma } from '@/lib/prisma';
import { canEditRegistration } from '@/lib/registration';
import { getAuthUser } from '@/lib/utils';

export const runtime = 'nodejs';

export async function DELETE(
  _request: Request,
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

    if (authUser.peran !== 'pendaftar') {
      return jsonResponse(
        { success: false, message: 'Hanya pendaftar yang dapat menghapus dokumen' },
        403,
      );
    }

    const { id } = await params;
    let documentId: bigint;

    try {
      documentId = BigInt(id);
    } catch {
      return jsonResponse(
        { success: false, message: 'ID dokumen tidak valid' },
        400,
      );
    }

    const document = await prisma.dokumenPendaftaran.findUnique({
      where: { id: documentId },
      include: { pendaftaran: true },
    });

    if (
      !document ||
      document.pendaftaran.penggunaId !== BigInt(authUser.id)
    ) {
      return jsonResponse(
        { success: false, message: 'Dokumen tidak ditemukan' },
        404,
      );
    }

    if (!canEditRegistration(document.pendaftaran.status)) {
      return jsonResponse(
        {
          success: false,
          message: `Dokumen tidak dapat dihapus pada status ${document.pendaftaran.status}`,
        },
        403,
      );
    }

    await prisma.dokumenPendaftaran.delete({ where: { id: document.id } });

    const absolutePath = path.join(
      documentStorageRoot,
      path.basename(document.lokasiFile),
    );
    try {
      await unlink(absolutePath);
    } catch {
      // Metadata has been removed; missing physical file should not fail the request.
    }

    return jsonResponse({
      success: true,
      message: 'Dokumen berhasil dihapus',
    });
  } catch (error) {
    console.error('DELETE_DOCUMENT_ERROR:', error);
    return jsonResponse(
      { success: false, message: 'Terjadi kesalahan pada server' },
      500,
    );
  }
}
