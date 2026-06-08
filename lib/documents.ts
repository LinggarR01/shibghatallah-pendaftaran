import crypto from 'node:crypto';
import path from 'node:path';
import type { JenisDokumen } from '@prisma/client';

export const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024;

export const allowedDocumentMimeTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const;

export const documentDefinitions: Array<{
  type: JenisDokumen;
  label: string;
  required: boolean;
}> = [
  { type: 'foto_santri', label: 'Foto santri', required: true },
  { type: 'kartu_keluarga', label: 'Kartu Keluarga', required: true },
  { type: 'akta_kelahiran', label: 'Akta kelahiran', required: true },
  {
    type: 'ijazah',
    label: 'Ijazah atau surat keterangan lulus',
    required: true,
  },
  { type: 'ktp_orang_tua', label: 'KTP orang tua/wali', required: true },
  { type: 'pas_foto', label: 'Pas foto', required: false },
  { type: 'lainnya', label: 'Dokumen lainnya', required: false },
];

const extensionByMimeType: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

export const documentStorageRoot = path.join(
  process.cwd(),
  'storage',
  'uploads',
  'documents',
);

export function isAllowedDocumentMimeType(
  mimeType: string,
): mimeType is (typeof allowedDocumentMimeTypes)[number] {
  return allowedDocumentMimeTypes.includes(
    mimeType as (typeof allowedDocumentMimeTypes)[number],
  );
}

export function getDocumentExtension(mimeType: string) {
  return extensionByMimeType[mimeType] ?? 'bin';
}

export function createSafeDocumentFileName(
  registrationId: bigint,
  documentType: JenisDokumen,
  mimeType: string,
) {
  const timestamp = Date.now();
  const randomPart = crypto.randomUUID();
  const extension = getDocumentExtension(mimeType);

  return `${registrationId.toString()}-${documentType}-${timestamp}-${randomPart}.${extension}`;
}

export function getDocumentLabel(type: JenisDokumen) {
  return (
    documentDefinitions.find((definition) => definition.type === type)?.label ??
    type
  );
}
