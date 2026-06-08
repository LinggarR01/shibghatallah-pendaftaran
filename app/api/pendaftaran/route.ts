// app/api/pendaftaran/route.ts
import { NextRequest } from 'next/server';
import { jsonResponse } from '@/lib/api-response';
import { getAuthUser, generateNomorPendaftaran } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Ambil user yang terautentikasi
    const authUser = await getAuthUser();

    if (!authUser) {
      return jsonResponse(
        {
          success: false,
          message: 'Anda harus login terlebih dahulu',
        },
        401,
      );
    }

    // Validasi peran user harus pendaftar
    if (authUser.peran !== 'pendaftar') {
      return jsonResponse(
        {
          success: false,
          message: 'Hanya pendaftar yang dapat membuat pendaftaran',
        },
        403,
      );
    }

    const body = await request.json();
    const { periodeId, profilSantri, profilOrangTua } = body;

    // Validasi field wajib
    if (!periodeId || !profilSantri || !profilOrangTua) {
      return jsonResponse(
        {
          success: false,
          message: 'periodeId, profilSantri, dan profilOrangTua wajib diisi',
        },
        400,
      );
    }

    const periodId = BigInt(periodeId);

    // Cek periode pendaftaran
    const periode = await prisma.periodePendaftaran.findUnique({
      where: { id: periodId },
    });

    if (!periode) {
      return jsonResponse(
        {
          success: false,
          message: 'Periode pendaftaran tidak ditemukan',
        },
        404,
      );
    }

    // Cek status periode masih dibuka
    if (periode.status !== 'dibuka') {
      return jsonResponse(
        {
          success: false,
          message: 'Periode pendaftaran sudah ditutup',
        },
        400,
      );
    }

    // Cek tanggal periode
    const now = new Date();
    if (now < periode.tanggalMulai || now > periode.tanggalSelesai) {
      return jsonResponse(
        {
          success: false,
          message: 'Periode pendaftaran tidak aktif saat ini',
        },
        400,
      );
    }

    // Cek user belum punya pendaftaran di periode ini
    const existingPendaftaran = await prisma.pendaftaran.findFirst({
      where: {
        penggunaId: BigInt(authUser.id),
        periodeId: periodId,
      },
    });

    if (existingPendaftaran) {
      return jsonResponse(
        {
          success: false,
          message: 'Anda sudah memiliki pendaftaran di periode ini',
        },
        400,
      );
    }

    // Validasi data profil santri minimal
    const { namaLengkap, jenisKelamin } = profilSantri;
    if (!namaLengkap || !jenisKelamin) {
      return jsonResponse(
        {
          success: false,
          message: 'namaLengkap dan jenisKelamin di profilSantri wajib diisi',
        },
        400,
      );
    }

    // Generate nomor pendaftaran
    // Ambil nomor urutan terbesar untuk tahun ini
    const lastPendaftaran = await prisma.pendaftaran.findMany({
      where: {
        nomorPendaftaran: {
          startsWith: `PSB-${new Date().getFullYear()}`,
        },
      },
      orderBy: {
        id: 'desc',
      },
      take: 1,
    });

    const nextNumber =
      lastPendaftaran.length > 0
        ? parseInt(lastPendaftaran[0].nomorPendaftaran.split('-')[2]) + 1
        : 1;

    const nomorPendaftaran = generateNomorPendaftaran(nextNumber);

    // Buat pendaftaran, profil santri, dan profil orang tua dalam satu transaksi
    const newPendaftaran = await prisma.pendaftaran.create({
      data: {
        penggunaId: BigInt(authUser.id),
        periodeId: periodId,
        nomorPendaftaran,
        status: 'draft',
        profilSantri: {
          create: {
            namaLengkap: profilSantri.namaLengkap,
            nisn: profilSantri.nisn || null,
            nik: profilSantri.nik || null,
            tempatLahir: profilSantri.tempatLahir || null,
            tanggalLahir: profilSantri.tanggalLahir
              ? new Date(profilSantri.tanggalLahir)
              : null,
            jenisKelamin: profilSantri.jenisKelamin,
            alamat: profilSantri.alamat || null,
            desa: profilSantri.desa || null,
            kecamatan: profilSantri.kecamatan || null,
            kota: profilSantri.kota || null,
            provinsi: profilSantri.provinsi || null,
            kodePos: profilSantri.kodePos || null,
            sekolahAsal: profilSantri.sekolahAsal || null,
            jenjangTujuan: profilSantri.jenjangTujuan || null,
          },
        },
        profilOrangTua: {
          create: {
            namaAyah: profilOrangTua.namaAyah || null,
            pekerjaanAyah: profilOrangTua.pekerjaanAyah || null,
            noHpAyah: profilOrangTua.noHpAyah || null,
            namaIbu: profilOrangTua.namaIbu || null,
            pekerjaanIbu: profilOrangTua.pekerjaanIbu || null,
            noHpIbu: profilOrangTua.noHpIbu || null,
            namaWali: profilOrangTua.namaWali || null,
            hubunganWali: profilOrangTua.hubunganWali || null,
            pekerjaanWali: profilOrangTua.pekerjaanWali || null,
            noHpWali: profilOrangTua.noHpWali || null,
            alamatOrangTua: profilOrangTua.alamatOrangTua || null,
          },
        },
      },
      include: {
        profilSantri: true,
        profilOrangTua: true,
        periode: true,
      },
    });

    return jsonResponse(
      {
        success: true,
        message: 'Pendaftaran berhasil dibuat',
        data: newPendaftaran,
      },
      201,
    );
  } catch (error) {
    console.error('CREATE_PENDAFTARAN_ERROR:', error);

    return jsonResponse(
      {
        success: false,
        message: 'Terjadi kesalahan pada server',
      },
      500,
    );
  }
}
