import 'dotenv/config';

import bcrypt from 'bcryptjs';
import {
  JenisDokumen,
  JenisKelamin,
  PeranPengguna,
  PrismaClient,
  StatusPendaftaran,
  StatusPeriode,
  StatusVerifikasiDokumen,
} from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const host = process.env.DB_HOST;
const port = Number(process.env.DB_PORT ?? 3306);
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD ?? '';
const database = process.env.DB_NAME;

if (!host) {
  throw new Error('DB_HOST belum diatur di file .env');
}

if (!user) {
  throw new Error('DB_USER belum diatur di file .env');
}

if (!database) {
  throw new Error('DB_NAME belum diatur di file .env');
}

const adapter = new PrismaMariaDb({
  host,
  port,
  user,
  password,
  database,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const passwordAdmin = await bcrypt.hash('admin12345', 10);
  const passwordPendaftar = await bcrypt.hash('pendaftar12345', 10);

  /**
   * Akun yang dibuat:
   * 1. admin@shibgotalloh.test
   *    Untuk login admin.
   *
   * 2. formulir@shibgotalloh.test
   *    Pendaftar baru yang BELUM memiliki data pendaftaran.
   *    Pakai akun ini untuk mengetes redirect ke /pendaftar/formulir.
   *
   * 3. pendaftar@shibgotalloh.test
   *    Pendaftar yang sudah mengirim formulir dan menunggu verifikasi.
   *
   * 4. siti@shibgotalloh.test
   *    Pendaftar yang butuh revisi dokumen.
   */

  const admin = await prisma.pengguna.upsert({
    where: {
      email: 'admin@shibgotalloh.test',
    },
    update: {
      nama: 'Admin Shibgotalloh',
      password: passwordAdmin,
      noHp: '081234567890',
      peran: PeranPengguna.admin,
    },
    create: {
      nama: 'Admin Shibgotalloh',
      email: 'admin@shibgotalloh.test',
      password: passwordAdmin,
      noHp: '081234567890',
      peran: PeranPengguna.admin,
    },
  });

  const pendaftarFormulir = await prisma.pengguna.upsert({
    where: {
      email: 'formulir@shibgotalloh.test',
    },
    update: {
      nama: 'Pendaftar Baru',
      password: passwordPendaftar,
      noHp: '081234567899',
      peran: PeranPengguna.pendaftar,
    },
    create: {
      nama: 'Pendaftar Baru',
      email: 'formulir@shibgotalloh.test',
      password: passwordPendaftar,
      noHp: '081234567899',
      peran: PeranPengguna.pendaftar,
    },
  });

  const pendaftarPertama = await prisma.pengguna.upsert({
    where: {
      email: 'pendaftar@shibgotalloh.test',
    },
    update: {
      nama: 'Ahmad Fauzan',
      password: passwordPendaftar,
      noHp: '081234567891',
      peran: PeranPengguna.pendaftar,
    },
    create: {
      nama: 'Ahmad Fauzan',
      email: 'pendaftar@shibgotalloh.test',
      password: passwordPendaftar,
      noHp: '081234567891',
      peran: PeranPengguna.pendaftar,
    },
  });

  const pendaftarKedua = await prisma.pengguna.upsert({
    where: {
      email: 'siti@shibgotalloh.test',
    },
    update: {
      nama: 'Siti Nurhaliza',
      password: passwordPendaftar,
      noHp: '081234567892',
      peran: PeranPengguna.pendaftar,
    },
    create: {
      nama: 'Siti Nurhaliza',
      email: 'siti@shibgotalloh.test',
      password: passwordPendaftar,
      noHp: '081234567892',
      peran: PeranPengguna.pendaftar,
    },
  });

  /**
   * Pastikan akun khusus tes formulir benar-benar belum punya pendaftaran.
   * Jadi setelah login, flow bisa diarahkan ke halaman /pendaftar/formulir.
   */
  await prisma.pendaftaran.deleteMany({
    where: {
      penggunaId: pendaftarFormulir.id,
    },
  });

  const periodeAktif = await prisma.periodePendaftaran.upsert({
    where: {
      id: BigInt(1),
    },
    update: {
      nama: 'Pendaftaran Santri Baru',
      tahunAjaran: '2026/2027',
      tanggalMulai: new Date('2026-05-01'),
      tanggalSelesai: new Date('2026-07-31'),
      status: StatusPeriode.dibuka,
    },
    create: {
      id: BigInt(1),
      nama: 'Pendaftaran Santri Baru',
      tahunAjaran: '2026/2027',
      tanggalMulai: new Date('2026-05-01'),
      tanggalSelesai: new Date('2026-07-31'),
      status: StatusPeriode.dibuka,
    },
  });

  await prisma.periodePendaftaran.upsert({
    where: {
      id: BigInt(2),
    },
    update: {
      nama: 'Pendaftaran Santri Baru',
      tahunAjaran: '2025/2026',
      tanggalMulai: new Date('2025-05-01'),
      tanggalSelesai: new Date('2025-07-31'),
      status: StatusPeriode.ditutup,
    },
    create: {
      id: BigInt(2),
      nama: 'Pendaftaran Santri Baru',
      tahunAjaran: '2025/2026',
      tanggalMulai: new Date('2025-05-01'),
      tanggalSelesai: new Date('2025-07-31'),
      status: StatusPeriode.ditutup,
    },
  });

  const dataPendaftaranPertama = await prisma.pendaftaran.upsert({
    where: {
      nomorPendaftaran: 'PSB-2026-0001',
    },
    update: {
      penggunaId: pendaftarPertama.id,
      periodeId: periodeAktif.id,
      status: StatusPendaftaran.menunggu_verifikasi,
      dikirimPada: new Date('2026-05-10T09:00:00'),
      diverifikasiPada: null,
      catatanAdmin: null,
    },
    create: {
      penggunaId: pendaftarPertama.id,
      periodeId: periodeAktif.id,
      nomorPendaftaran: 'PSB-2026-0001',
      status: StatusPendaftaran.menunggu_verifikasi,
      dikirimPada: new Date('2026-05-10T09:00:00'),
    },
  });

  await prisma.profilSantri.upsert({
    where: {
      pendaftaranId: dataPendaftaranPertama.id,
    },
    update: {
      namaLengkap: 'Ahmad Fauzan',
      nisn: '1234567890',
      nik: '3210123456780001',
      tempatLahir: 'Karawang',
      tanggalLahir: new Date('2012-03-15'),
      jenisKelamin: JenisKelamin.laki_laki,
      alamat: 'Dusun Sukamaju RT 01 RW 02',
      desa: 'Cikampek Barat',
      kecamatan: 'Cikampek',
      kota: 'Karawang',
      provinsi: 'Jawa Barat',
      kodePos: '41373',
      sekolahAsal: 'SDN Cikampek 1',
      jenjangTujuan: 'MTs',
    },
    create: {
      pendaftaranId: dataPendaftaranPertama.id,
      namaLengkap: 'Ahmad Fauzan',
      nisn: '1234567890',
      nik: '3210123456780001',
      tempatLahir: 'Karawang',
      tanggalLahir: new Date('2012-03-15'),
      jenisKelamin: JenisKelamin.laki_laki,
      alamat: 'Dusun Sukamaju RT 01 RW 02',
      desa: 'Cikampek Barat',
      kecamatan: 'Cikampek',
      kota: 'Karawang',
      provinsi: 'Jawa Barat',
      kodePos: '41373',
      sekolahAsal: 'SDN Cikampek 1',
      jenjangTujuan: 'MTs',
    },
  });

  await prisma.profilOrangTua.upsert({
    where: {
      pendaftaranId: dataPendaftaranPertama.id,
    },
    update: {
      namaAyah: 'Budi Santoso',
      nikAyah: '3210123456780002',
      pekerjaanAyah: 'Wiraswasta',
      noHpAyah: '081234567893',
      pendidikanAyah: 'SMA',
      namaIbu: 'Siti Aminah',
      nikIbu: '3210123456780003',
      pekerjaanIbu: 'Ibu Rumah Tangga',
      noHpIbu: '081234567894',
      pendidikanIbu: 'SMA',
      namaWali: null,
      nikWali: null,
      hubunganWali: null,
      pekerjaanWali: null,
      noHpWali: null,
      pendidikanWali: null,
      alamatOrangTua: 'Dusun Sukamaju RT 01 RW 02, Cikampek Barat',
    },
    create: {
      pendaftaranId: dataPendaftaranPertama.id,
      namaAyah: 'Budi Santoso',
      nikAyah: '3210123456780002',
      pekerjaanAyah: 'Wiraswasta',
      noHpAyah: '081234567893',
      pendidikanAyah: 'SMA',
      namaIbu: 'Siti Aminah',
      nikIbu: '3210123456780003',
      pekerjaanIbu: 'Ibu Rumah Tangga',
      noHpIbu: '081234567894',
      pendidikanIbu: 'SMA',
      alamatOrangTua: 'Dusun Sukamaju RT 01 RW 02, Cikampek Barat',
    },
  });

  await prisma.dokumenPendaftaran.deleteMany({
    where: {
      pendaftaranId: dataPendaftaranPertama.id,
    },
  });

  await prisma.dokumenPendaftaran.createMany({
    data: [
      {
        pendaftaranId: dataPendaftaranPertama.id,
        jenisDokumen: JenisDokumen.kartu_keluarga,
        namaFile: 'kartu-keluarga-ahmad.pdf',
        lokasiFile: '/uploads/dokumen/kartu-keluarga-ahmad.pdf',
        tipeFile: 'application/pdf',
        ukuranFile: BigInt(250000),
        statusVerifikasi: StatusVerifikasiDokumen.menunggu,
      },
      {
        pendaftaranId: dataPendaftaranPertama.id,
        jenisDokumen: JenisDokumen.akta_kelahiran,
        namaFile: 'akta-kelahiran-ahmad.pdf',
        lokasiFile: '/uploads/dokumen/akta-kelahiran-ahmad.pdf',
        tipeFile: 'application/pdf',
        ukuranFile: BigInt(180000),
        statusVerifikasi: StatusVerifikasiDokumen.valid,
      },
      {
        pendaftaranId: dataPendaftaranPertama.id,
        jenisDokumen: JenisDokumen.pas_foto,
        namaFile: 'pas-foto-ahmad.pdf',
        lokasiFile: '/uploads/dokumen/pas-foto-ahmad.pdf',
        tipeFile: 'application/pdf',
        ukuranFile: BigInt(120000),
        statusVerifikasi: StatusVerifikasiDokumen.menunggu,
      },
    ],
  });

  const dataPendaftaranKedua = await prisma.pendaftaran.upsert({
    where: {
      nomorPendaftaran: 'PSB-2026-0002',
    },
    update: {
      penggunaId: pendaftarKedua.id,
      periodeId: periodeAktif.id,
      status: StatusPendaftaran.perlu_revisi,
      dikirimPada: new Date('2026-05-11T10:30:00'),
      diverifikasiPada: null,
      catatanAdmin:
        'Mohon upload ulang dokumen kartu keluarga yang lebih jelas.',
    },
    create: {
      penggunaId: pendaftarKedua.id,
      periodeId: periodeAktif.id,
      nomorPendaftaran: 'PSB-2026-0002',
      status: StatusPendaftaran.perlu_revisi,
      dikirimPada: new Date('2026-05-11T10:30:00'),
      catatanAdmin:
        'Mohon upload ulang dokumen kartu keluarga yang lebih jelas.',
    },
  });

  await prisma.profilSantri.upsert({
    where: {
      pendaftaranId: dataPendaftaranKedua.id,
    },
    update: {
      namaLengkap: 'Siti Nurhaliza',
      nisn: '0987654321',
      nik: '3210123456780004',
      tempatLahir: 'Purwakarta',
      tanggalLahir: new Date('2012-08-21'),
      jenisKelamin: JenisKelamin.perempuan,
      alamat: 'Kampung Mekarsari RT 03 RW 01',
      desa: 'Dawuan Barat',
      kecamatan: 'Cikampek',
      kota: 'Karawang',
      provinsi: 'Jawa Barat',
      kodePos: '41373',
      sekolahAsal: 'SDN Dawuan Barat 2',
      jenjangTujuan: 'MTs',
    },
    create: {
      pendaftaranId: dataPendaftaranKedua.id,
      namaLengkap: 'Siti Nurhaliza',
      nisn: '0987654321',
      nik: '3210123456780004',
      tempatLahir: 'Purwakarta',
      tanggalLahir: new Date('2012-08-21'),
      jenisKelamin: JenisKelamin.perempuan,
      alamat: 'Kampung Mekarsari RT 03 RW 01',
      desa: 'Dawuan Barat',
      kecamatan: 'Cikampek',
      kota: 'Karawang',
      provinsi: 'Jawa Barat',
      kodePos: '41373',
      sekolahAsal: 'SDN Dawuan Barat 2',
      jenjangTujuan: 'MTs',
    },
  });

  await prisma.profilOrangTua.upsert({
    where: {
      pendaftaranId: dataPendaftaranKedua.id,
    },
    update: {
      namaAyah: 'Rahmat Hidayat',
      nikAyah: '3210123456780005',
      pekerjaanAyah: 'Karyawan Swasta',
      noHpAyah: '081234567895',
      pendidikanAyah: 'S1',
      namaIbu: 'Nur Aisyah',
      nikIbu: '3210123456780006',
      pekerjaanIbu: 'Guru',
      noHpIbu: '081234567896',
      pendidikanIbu: 'S1',
      namaWali: 'Dedi Setiawan',
      nikWali: '3210123456780007',
      hubunganWali: 'Paman',
      pekerjaanWali: 'Pedagang',
      noHpWali: '081234567897',
      pendidikanWali: 'SMA',
      alamatOrangTua: 'Kampung Mekarsari RT 03 RW 01, Dawuan Barat',
    },
    create: {
      pendaftaranId: dataPendaftaranKedua.id,
      namaAyah: 'Rahmat Hidayat',
      nikAyah: '3210123456780005',
      pekerjaanAyah: 'Karyawan Swasta',
      noHpAyah: '081234567895',
      pendidikanAyah: 'S1',
      namaIbu: 'Nur Aisyah',
      nikIbu: '3210123456780006',
      pekerjaanIbu: 'Guru',
      noHpIbu: '081234567896',
      pendidikanIbu: 'S1',
      namaWali: 'Dedi Setiawan',
      nikWali: '3210123456780007',
      hubunganWali: 'Paman',
      pekerjaanWali: 'Pedagang',
      noHpWali: '081234567897',
      pendidikanWali: 'SMA',
      alamatOrangTua: 'Kampung Mekarsari RT 03 RW 01, Dawuan Barat',
    },
  });

  await prisma.dokumenPendaftaran.deleteMany({
    where: {
      pendaftaranId: dataPendaftaranKedua.id,
    },
  });

  await prisma.dokumenPendaftaran.createMany({
    data: [
      {
        pendaftaranId: dataPendaftaranKedua.id,
        jenisDokumen: JenisDokumen.kartu_keluarga,
        namaFile: 'kartu-keluarga-siti.pdf',
        lokasiFile: '/uploads/dokumen/kartu-keluarga-siti.pdf',
        tipeFile: 'application/pdf',
        ukuranFile: BigInt(260000),
        statusVerifikasi: StatusVerifikasiDokumen.tidak_valid,
        catatanAdmin: 'File kurang jelas, mohon upload ulang.',
      },
      {
        pendaftaranId: dataPendaftaranKedua.id,
        jenisDokumen: JenisDokumen.akta_kelahiran,
        namaFile: 'akta-kelahiran-siti.pdf',
        lokasiFile: '/uploads/dokumen/akta-kelahiran-siti.pdf',
        tipeFile: 'application/pdf',
        ukuranFile: BigInt(170000),
        statusVerifikasi: StatusVerifikasiDokumen.valid,
      },
      {
        pendaftaranId: dataPendaftaranKedua.id,
        jenisDokumen: JenisDokumen.rapor,
        namaFile: 'rapor-siti.pdf',
        lokasiFile: '/uploads/dokumen/rapor-siti.pdf',
        tipeFile: 'application/pdf',
        ukuranFile: BigInt(450000),
        statusVerifikasi: StatusVerifikasiDokumen.menunggu,
      },
    ],
  });

  console.log('Seed berhasil dibuat.');
  console.table([
    {
      role: 'admin',
      email: admin.email,
      password: 'admin12345',
      keterangan: 'Masuk dashboard admin',
    },
    {
      role: 'pendaftar',
      email: pendaftarFormulir.email,
      password: 'pendaftar12345',
      keterangan: 'Belum punya pendaftaran, untuk tes /pendaftar/formulir',
    },
    {
      role: 'pendaftar',
      email: pendaftarPertama.email,
      password: 'pendaftar12345',
      keterangan: 'Sudah mengirim formulir, status menunggu verifikasi',
    },
    {
      role: 'pendaftar',
      email: pendaftarKedua.email,
      password: 'pendaftar12345',
      keterangan: 'Sudah mengirim formulir, status perlu revisi',
    },
  ]);
}

main()
  .catch((error) => {
    console.error('Seed gagal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
