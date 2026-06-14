import { prisma } from '@/lib/prisma';
import type { StatusPendaftaran } from '@/lib/registration';
import type { Prisma } from '@prisma/client';

export type PendaftaranSearchFilters = {
  search?: string;
  status?: StatusPendaftaran;
  periodeId?: bigint;
};

export function buildPendaftaranAdminWhere(
  filters: PendaftaranSearchFilters,
): Prisma.PendaftaranWhereInput {
  const where: Prisma.PendaftaranWhereInput = {};
  const search = filters.search?.trim();

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.periodeId) {
    where.periodeId = filters.periodeId;
  }

  if (search) {
    const contains = { contains: search };

    where.OR = [
      { nomorPendaftaran: contains },
      { pengguna: { nama: contains } },
      { pengguna: { email: contains } },
      { pengguna: { noHp: contains } },
      { profilSantri: { namaLengkap: contains } },
      { profilSantri: { nik: contains } },
      { sekolahSebelumnya: { namaSekolah: contains } },
    ];
  }

  return where;
}

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
      sekolahSebelumnya: true,
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
  const where = buildPendaftaranAdminWhere(filters);

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
      sekolahSebelumnya: true,
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
      sekolahSebelumnya: true,
      dokumen: true,
    },
  });
}
