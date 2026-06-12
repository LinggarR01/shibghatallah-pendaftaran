import { z } from 'zod';
import { documentTypes } from '@/lib/documents';

export const documentTypeSchema = z.enum(documentTypes);

export const updateRegistrationStatusSchema = z.object({
  status: z.enum([
    'draft',
    'menunggu_verifikasi',
    'perlu_revisi',
    'diterima',
    'ditolak',
  ]),
  catatanAdmin: z.string().trim().max(2000).optional().nullable(),
});
