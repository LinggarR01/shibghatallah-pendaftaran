import path from 'node:path';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { NextRequest } from 'next/server';
import { jsonResponse } from '@/lib/api-response';
import {
  createSafeDocumentFileName,
  documentDefinitions,
  documentStorageRoot,
  documentTypes,
  isAllowedDocumentMimeType,
  type JenisDokumen,
  MAX_DOCUMENT_SIZE,
} from '@/lib/documents';
import { prisma } from '@/lib/prisma';
import { canEditRegistration } from '@/lib/registration';
import { getAuthUser } from '@/lib/utils';

export const runtime = 'nodejs';

type ExistingDocumentFile = {
  lokasiFile: string;
};

async function getCurrentRegistration(penggunaId: bigint) {
  return prisma.pendaftaran.findFirst({
    where: { penggunaId },
    include: {
      dokumen: {
        orderBy: { diunggahPada: 'desc' },
      },
    },
    orderBy: { dibuatPada: 'desc' },
  });
}

function sanitizeDocument(document: {
  id: bigint;
  jenisDokumen: JenisDokumen;
  namaFile: string;
  tipeFile: string | null;
  ukuranFile: bigint | null;
  statusVerifikasi: string;
  catatanAdmin: string | null;
  diunggahPada: Date;
}) {
  return {
    id: document.id,
    jenisDokumen: document.jenisDokumen,
    namaFile: document.namaFile,
    tipeFile: document.tipeFile,
    ukuranFile: document.ukuranFile,
    statusVerifikasi: document.statusVerifikasi,
    catatanAdmin: document.catatanAdmin,
    diunggahPada: document.diunggahPada,
    url: `/api/documents/${document.id.toString()}`,
  };
}

async function removeStoredFile(relativePath: string | null | undefined) {
  if (!relativePath) return;

  const absolutePath = path.join(documentStorageRoot, path.basename(relativePath));

  try {
    await unlink(absolutePath);
  } catch {
    // File metadata may outlive the physical file; deletion should remain idempotent.
  }
}

export async function GET() {
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
        { success: false, message: 'Hanya pendaftar yang dapat mengakses dokumen' },
        403,
      );
    }

    const registration = await getCurrentRegistration(BigInt(authUser.id));
    const documents = registration?.dokumen.map(sanitizeDocument) ?? [];

    return jsonResponse({
      success: true,
      message: 'Data dokumen berhasil diambil',
      data: {
        canEdit: registration ? canEditRegistration(registration.status) : false,
        status: registration?.status ?? null,
        definitions: documentDefinitions,
        documents,
      },
    });
  } catch (error) {
    console.error('GET_PENDAFTAR_DOCUMENTS_ERROR:', error);
    return jsonResponse(
      { success: false, message: 'Terjadi kesalahan pada server' },
      500,
    );
  }
}

export async function POST(request: NextRequest) {
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
        { success: false, message: 'Hanya pendaftar yang dapat upload dokumen' },
        403,
      );
    }

    const registration = await getCurrentRegistration(BigInt(authUser.id));

    if (!registration) {
      return jsonResponse(
        { success: false, message: 'Isi formulir pendaftaran terlebih dahulu' },
        400,
      );
    }

    if (!canEditRegistration(registration.status)) {
      return jsonResponse(
        {
          success: false,
          message: `Dokumen tidak dapat diubah pada status ${registration.status}`,
        },
        403,
      );
    }

    const formData = await request.formData();
    const documentType = formData.get('documentType');
    const file = formData.get('file');

    if (
      typeof documentType !== 'string' ||
      !documentTypes.includes(documentType as JenisDokumen)
    ) {
      return jsonResponse(
        { success: false, message: 'Jenis dokumen tidak valid' },
        400,
      );
    }

    if (!(file instanceof File)) {
      return jsonResponse(
        { success: false, message: 'File dokumen wajib diunggah' },
        400,
      );
    }

    if (!isAllowedDocumentMimeType(file.type)) {
      return jsonResponse(
        {
          success: false,
          message: 'Format file harus PDF, JPG, JPEG, atau PNG',
        },
        400,
      );
    }

    if (file.size > MAX_DOCUMENT_SIZE) {
      return jsonResponse(
        { success: false, message: 'Ukuran file maksimal 5 MB' },
        400,
      );
    }

    await mkdir(documentStorageRoot, { recursive: true });

    const safeFileName = createSafeDocumentFileName(
      registration.id,
      documentType as JenisDokumen,
      file.type,
    );
    const absolutePath = path.join(documentStorageRoot, safeFileName);
    const relativePath = path.relative(process.cwd(), absolutePath);
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(absolutePath, buffer);

    const existingDocuments = (await prisma.dokumenPendaftaran.findMany({
      where: {
        pendaftaranId: registration.id,
        jenisDokumen: documentType as JenisDokumen,
      },
    })) as ExistingDocumentFile[];

    await prisma.$transaction([
      prisma.dokumenPendaftaran.deleteMany({
        where: {
          pendaftaranId: registration.id,
          jenisDokumen: documentType as JenisDokumen,
        },
      }),
      prisma.dokumenPendaftaran.create({
        data: {
          pendaftaranId: registration.id,
          jenisDokumen: documentType as JenisDokumen,
          namaFile: safeFileName,
          lokasiFile: relativePath,
          tipeFile: file.type,
          ukuranFile: BigInt(file.size),
        },
      }),
    ]);

    await Promise.all(
      existingDocuments.map((document: ExistingDocumentFile) =>
        removeStoredFile(document.lokasiFile),
      ),
    );

    return jsonResponse({
      success: true,
      message: 'Dokumen berhasil diunggah',
    });
  } catch (error) {
    console.error('UPLOAD_DOCUMENT_ERROR:', error);
    return jsonResponse(
      { success: false, message: 'Terjadi kesalahan pada server' },
      500,
    );
  }
}
