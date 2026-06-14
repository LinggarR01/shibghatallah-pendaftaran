import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { NextRequest } from 'next/server';
import { documentStorageRoot, getDocumentLabel } from '@/lib/documents';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/utils';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authUser = await getAuthUser();

  if (!authUser) {
    return Response.json(
      { success: false, message: 'Anda harus login terlebih dahulu' },
      { status: 401 },
    );
  }

  const { id } = await params;
  let documentId: bigint;

  try {
    documentId = BigInt(id);
  } catch {
    return Response.json(
      { success: false, message: 'ID dokumen tidak valid' },
      { status: 400 },
    );
  }

  const document = await prisma.dokumenPendaftaran.findUnique({
    where: { id: documentId },
    include: {
      pendaftaran: {
        select: {
          penggunaId: true,
        },
      },
    },
  });

  if (!document) {
    return Response.json(
      { success: false, message: 'Dokumen tidak ditemukan' },
      { status: 404 },
    );
  }

  const isOwner = document.pendaftaran.penggunaId === BigInt(authUser.id);
  const isAdmin = authUser.peran === 'admin';

  if (!isOwner && !isAdmin) {
    return Response.json(
      { success: false, message: 'Anda tidak memiliki akses dokumen ini' },
      { status: 403 },
    );
  }

  const absolutePath = path.join(
    documentStorageRoot,
    path.basename(document.lokasiFile),
  );

  try {
    const fileBuffer = await readFile(absolutePath);
    const disposition = request.nextUrl.searchParams.get('download')
      ? 'attachment'
      : 'inline';
    const label = getDocumentLabel(document.jenisDokumen)
      .toLowerCase()
      .replaceAll(' ', '-');

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': document.tipeFile ?? 'application/octet-stream',
        'Content-Disposition': `${disposition}; filename="${label}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return Response.json(
      { success: false, message: 'Dokumen tidak tersedia' },
      { status: 404 },
    );
  }
}
