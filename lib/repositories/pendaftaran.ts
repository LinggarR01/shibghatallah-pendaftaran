import { prisma } from '@/lib/prisma';
import type { StatusPendaftaran } from '@/lib/registration';

export type PendaftaranSearchFilters = {
  search?: string;
  status?: StatusPendaftaran;
  periodeId?: bigint;
};

export async function findPendaftaranByIdForUser(
  id: bigint,
  penggunaId: bigint,
) {
  return prisma.pendaftaran.findFirst({
    where: {
      id,
      penggunaId,
    },
    include: {
      pengguna: {
        select: {
          id: true,
          nama: true,
          email: true,
          noHp: true,
          peran: true,
        },
      },
      periode: true,
      profilSantri: true,
      profilOrangTua: true,
      dokumen: {
        select: {
          id: true,
          jenisDokumen: true,
          namaFile: true,
          tipeFile: true,
          ukuranFile: true,
          statusVerifikasi: true,
          catatanAdmin: true,
          diunggahPada: true,
        },
      },
    },
  });
}

export async function findPendaftaranListForAdmin(
  filters: PendaftaranSearchFilters,
) {
  const where: Record<string, unknown> = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.periodeId) {
    where.periodeId = filters.periodeId;
  }

  if (filters.search) {
    where.OR = [
      { nomorPendaftaran: { contains: filters.search, mode: 'insensitive' } },
      {
        pengguna: {
          nama: { contains: filters.search, mode: 'insensitive' },
        },
      },
      {
        pengguna: {
          email: { contains: filters.search, mode: 'insensitive' },
        },
      },
    ];
  }

  return prisma.pendaftaran.findMany({
    where,
    include: {
      pengguna: {
        select: {
          id: true,
          nama: true,
          email: true,
          noHp: true,
          peran: true,
        },
      },
      periode: true,
      profilSantri: true,
      profilOrangTua: true,
      dokumen: {
        select: {
          id: true,
          jenisDokumen: true,
          statusVerifikasi: true,
        },
      },
    },
    orderBy: {
      dibuatPada: 'desc',
    },
  });
}

export async function findPendaftaranByIdForAdmin(id: bigint) {
  return prisma.pendaftaran.findUnique({
    where: { id },
    include: {
      pengguna: {
        select: {
          id: true,
          nama: true,
          email: true,
          noHp: true,
          peran: true,
        },
      },
      periode: true,
      profilSantri: true,
      profilOrangTua: true,
      dokumen: true,
    },
  });
}
