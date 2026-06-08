import { JenisDokumen } from '@prisma/client';
import { z } from 'zod';

export const documentTypeSchema = z.enum(JenisDokumen);

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
