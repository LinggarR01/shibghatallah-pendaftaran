import { prisma } from '@/lib/prisma';
import {
  buildPendaftaranAdminWhere,
  type PendaftaranSearchFilters,
} from '@/lib/repositories/pendaftaran';
import { createXlsxWorkbook } from './xlsx';

const headers = [
  'Nomor Pendaftaran',
  'Nama Akun',
  'Email',
  'Nomor HP',
  'Nama Calon Santri',
  'NIK Calon Santri',
  'Tempat Lahir',
  'Tanggal Lahir',
  'Jenis Kelamin',
  'Alamat',
  'Nama Ayah',
  'Nama Ibu',
  'Nama Wali',
  'Pendidikan Sebelumnya',
  'Status Pendaftaran',
  'Catatan Admin',
  'Tanggal Daftar',
  'Tanggal Verifikasi',
] as const;

const statusLabels: Record<string, string> = {
  draft: 'DRAFT',
  menunggu_verifikasi: 'MENUNGGU VERIFIKASI',
  dikirim: 'DIKIRIM',
  sedang_diperiksa: 'SEDANG DIPERIKSA',
  perlu_revisi: 'PERLU REVISI',
  diterima: 'DITERIMA',
  ditolak: 'DITOLAK',
};

const genderLabels: Record<string, string> = {
  laki_laki: 'Laki-laki',
  perempuan: 'Perempuan',
};

function formatDate(date: Date | null | undefined) {
  if (!date) return '';

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatEducation(
  school:
    | {
        namaSekolah: string;
        npsn: string | null;
        tahunLulus: string | null;
      }
    | null,
) {
  if (!school) return '';

  return [
    school.namaSekolah,
    school.npsn ? `NPSN ${school.npsn}` : null,
    school.tahunLulus ? `Lulus ${school.tahunLulus}` : null,
  ]
    .filter(Boolean)
    .join(' - ');
}

export function buildPendaftarExportFileName(date = new Date()) {
  const safeDate = date.toISOString().slice(0, 10);

  return `data-pendaftar-shibghatallah-${safeDate}.xlsx`;
}

export async function createPendaftarExportWorkbook(
  filters: PendaftaranSearchFilters,
) {
  const registrations = await prisma.pendaftaran.findMany({
    where: buildPendaftaranAdminWhere(filters),
    orderBy: { dibuatPada: 'desc' },
    include: {
      pengguna: {
        select: {
          nama: true,
          email: true,
          noHp: true,
        },
      },
      profilSantri: {
        select: {
          namaLengkap: true,
          nik: true,
          tempatLahir: true,
          tanggalLahir: true,
          jenisKelamin: true,
          alamat: true,
        },
      },
      profilOrangTua: {
        select: {
          namaAyah: true,
          namaIbu: true,
          namaWali: true,
        },
      },
      sekolahSebelumnya: {
        select: {
          namaSekolah: true,
          npsn: true,
          tahunLulus: true,
        },
      },
    },
  });

  const rows = registrations.map((registration) => [
    registration.nomorPendaftaran,
    registration.pengguna.nama,
    registration.pengguna.email,
    registration.pengguna.noHp ?? '',
    registration.profilSantri?.namaLengkap ?? '',
    registration.profilSantri?.nik ?? '',
    registration.profilSantri?.tempatLahir ?? '',
    formatDate(registration.profilSantri?.tanggalLahir),
    registration.profilSantri?.jenisKelamin
      ? genderLabels[registration.profilSantri.jenisKelamin]
      : '',
    registration.profilSantri?.alamat ?? '',
    registration.profilOrangTua?.namaAyah ?? '',
    registration.profilOrangTua?.namaIbu ?? '',
    registration.profilOrangTua?.namaWali ?? '',
    formatEducation(registration.sekolahSebelumnya),
    statusLabels[registration.status] ?? registration.status,
    registration.catatanAdmin ?? '',
    formatDate(registration.dibuatPada),
    formatDate(registration.diverifikasiPada),
  ]);

  return createXlsxWorkbook({
    sheetName: 'Data Pendaftar',
    headers: [...headers],
    rows,
  });
}
