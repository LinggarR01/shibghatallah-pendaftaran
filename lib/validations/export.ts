import { z } from 'zod';
import { registrationStatuses } from '@/lib/registration';

export const pendaftarExportQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z
    .enum(registrationStatuses)
    .or(z.literal(''))
    .optional()
    .transform((value) => (value ? value : undefined)),
});
