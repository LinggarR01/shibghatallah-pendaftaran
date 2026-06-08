import type { PendaftaranSearchFilters } from '@/lib/repositories/pendaftaran';
import * as pendaftaranRepository from '@/lib/repositories/pendaftaran';

export async function getPendaftaranListForAdmin(
  filters: PendaftaranSearchFilters,
) {
  return pendaftaranRepository.findPendaftaranListForAdmin(filters);
}

export async function getPendaftaranByIdForAdmin(id: bigint) {
  return pendaftaranRepository.findPendaftaranByIdForAdmin(id);
}

export async function getPendaftaranByIdForUser(
  id: bigint,
  penggunaId: bigint,
) {
  return pendaftaranRepository.findPendaftaranByIdForUser(id, penggunaId);
}
