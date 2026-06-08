import { NextRequest } from 'next/server';
import { jsonResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { canEditRegistration } from '@/lib/registration';
import { getAuthUser, generateNomorPendaftaran } from '@/lib/utils';
import {
  getFirstRegistrationValidationMessage,
  registrationDraftSchema,
} from '@/lib/validations/registration';

async function getCurrentRegistration(penggunaId: bigint) {
  return prisma.pendaftaran.findFirst({
    where: { penggunaId },
    include: {
      profilSantri: true,
      profilOrangTua: true,
      sekolahSebelumnya: true,
      dokumen: true,
    },
    orderBy: { dibuatPada: 'desc' },
  });
}

async function getOpenPeriodId() {
  const now = new Date();
  const activePeriod = await prisma.periodePendaftaran.findFirst({
    where: {
      status: 'dibuka',
      tanggalMulai: { lte: now },
      tanggalSelesai: { gte: now },
    },
    orderBy: { tanggalMulai: 'desc' },
  });

  if (activePeriod) {
    return activePeriod.id;
  }

  const fallbackPeriod = await prisma.periodePendaftaran.findFirst({
    where: { status: 'dibuka' },
    orderBy: { tanggalMulai: 'desc' },
  });

  return fallbackPeriod?.id ?? null;
}

async function generateNextRegistrationNumber() {
  const year = new Date().getFullYear();
  const lastRegistration = await prisma.pendaftaran.findFirst({
    where: { nomorPendaftaran: { startsWith: `PSB-${year}` } },
    orderBy: { id: 'desc' },
  });
  const lastNumber = lastRegistration
    ? Number(lastRegistration.nomorPendaftaran.split('-')[2])
    : 0;

  return generateNomorPendaftaran(lastNumber + 1);
}

export async function GET() {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return jsonResponse(
        { success: false, message: 'Anda harus login terlebih dahulu' },
        401,
      );
    }

    if (authUser.peran !== 'pendaftar') {
      return jsonResponse(
        { success: false, message: 'Hanya pendaftar yang dapat mengakses data ini' },
        403,
      );
    }

    const registration = await getCurrentRegistration(BigInt(authUser.id));

    return jsonResponse(
      {
        success: true,
        message: 'Data pendaftaran berhasil diambil',
        data: registration,
      },
      200,
    );
  } catch (error) {
    console.error('GET_CURRENT_REGISTRATION_ERROR:', error);
    return jsonResponse(
      { success: false, message: 'Terjadi kesalahan pada server' },
      500,
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return jsonResponse(
        { success: false, message: 'Anda harus login terlebih dahulu' },
        401,
      );
    }

    if (authUser.peran !== 'pendaftar') {
      return jsonResponse(
        { success: false, message: 'Hanya pendaftar yang dapat menyimpan draft' },
        403,
      );
    }

    const body = await request.json();
    const parsedBody = registrationDraftSchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonResponse(
        {
          success: false,
          message: getFirstRegistrationValidationMessage(parsedBody.error),
          errors: parsedBody.error.flatten().fieldErrors,
        },
        400,
      );
    }

    const penggunaId = BigInt(authUser.id);
    const existingRegistration = await getCurrentRegistration(penggunaId);

    if (
      existingRegistration &&
      !canEditRegistration(existingRegistration.status)
    ) {
      return jsonResponse(
        {
          success: false,
          message: `Pendaftaran dengan status ${existingRegistration.status} tidak dapat diedit`,
        },
        403,
      );
    }

    const periodeId = existingRegistration?.periodeId ?? (await getOpenPeriodId());

    if (!periodeId) {
      return jsonResponse(
        {
          success: false,
          message: 'Periode pendaftaran aktif belum tersedia',
        },
        400,
      );
    }

    const nomorPendaftaran =
      existingRegistration?.nomorPendaftaran ??
      (await generateNextRegistrationNumber());

    const { student, parent, previousSchool } = parsedBody.data;

    const registration = await prisma.pendaftaran.upsert({
      where: {
        id: existingRegistration?.id ?? BigInt(0),
      },
      update: {
        status:
          existingRegistration?.status === 'perlu_revisi'
            ? 'perlu_revisi'
            : 'draft',
        profilSantri: {
          upsert: {
            create: {
              namaLengkap: student.fullName ?? authUser.nama,
              nik: student.nik,
              nisn: student.nisn,
              jenisKelamin: student.gender ?? 'laki_laki',
              tempatLahir: student.birthPlace,
              tanggalLahir: student.birthDate ? new Date(student.birthDate) : null,
              alamat: student.address,
              provinsi: student.province,
              kota: student.city,
              kecamatan: student.district,
              desa: student.village,
              kodePos: student.postalCode,
              noHp: student.phone,
              anakKe: student.childOrder,
              jumlahSaudara: student.siblingCount,
              riwayatPenyakit: student.medicalHistory,
              sekolahAsal: previousSchool.schoolName,
            },
            update: {
              namaLengkap: student.fullName ?? authUser.nama,
              nik: student.nik,
              nisn: student.nisn,
              jenisKelamin: student.gender ?? 'laki_laki',
              tempatLahir: student.birthPlace,
              tanggalLahir: student.birthDate ? new Date(student.birthDate) : null,
              alamat: student.address,
              provinsi: student.province,
              kota: student.city,
              kecamatan: student.district,
              desa: student.village,
              kodePos: student.postalCode,
              noHp: student.phone,
              anakKe: student.childOrder,
              jumlahSaudara: student.siblingCount,
              riwayatPenyakit: student.medicalHistory,
              sekolahAsal: previousSchool.schoolName,
            },
          },
        },
        profilOrangTua: {
          upsert: {
            create: {
              namaAyah: parent.fatherName,
              nikAyah: parent.fatherNik,
              pekerjaanAyah: parent.fatherJob,
              pendidikanAyah: parent.fatherEducation,
              noHpAyah: parent.fatherPhone,
              penghasilanAyah: parent.fatherIncome,
              namaIbu: parent.motherName,
              nikIbu: parent.motherNik,
              pekerjaanIbu: parent.motherJob,
              pendidikanIbu: parent.motherEducation,
              noHpIbu: parent.motherPhone,
              penghasilanIbu: parent.motherIncome,
              namaWali: parent.guardianName,
              hubunganWali: parent.guardianRelation,
              noHpWali: parent.guardianPhone,
              alamatWali: parent.guardianAddress,
              pekerjaanWali: parent.guardianJob,
            },
            update: {
              namaAyah: parent.fatherName,
              nikAyah: parent.fatherNik,
              pekerjaanAyah: parent.fatherJob,
              pendidikanAyah: parent.fatherEducation,
              noHpAyah: parent.fatherPhone,
              penghasilanAyah: parent.fatherIncome,
              namaIbu: parent.motherName,
              nikIbu: parent.motherNik,
              pekerjaanIbu: parent.motherJob,
              pendidikanIbu: parent.motherEducation,
              noHpIbu: parent.motherPhone,
              penghasilanIbu: parent.motherIncome,
              namaWali: parent.guardianName,
              hubunganWali: parent.guardianRelation,
              noHpWali: parent.guardianPhone,
              alamatWali: parent.guardianAddress,
              pekerjaanWali: parent.guardianJob,
            },
          },
        },
        sekolahSebelumnya: {
          upsert: {
            create: {
              namaSekolah: previousSchool.schoolName ?? '-',
              npsn: previousSchool.npsn,
              alamatSekolah: previousSchool.schoolAddress,
              tahunLulus: previousSchool.graduationYear,
              nomorIjazah: previousSchool.certificateNumber,
            },
            update: {
              namaSekolah: previousSchool.schoolName ?? '-',
              npsn: previousSchool.npsn,
              alamatSekolah: previousSchool.schoolAddress,
              tahunLulus: previousSchool.graduationYear,
              nomorIjazah: previousSchool.certificateNumber,
            },
          },
        },
      },
      create: {
        penggunaId,
        periodeId,
        nomorPendaftaran,
        status: 'draft',
        profilSantri: {
          create: {
            namaLengkap: student.fullName ?? authUser.nama,
            nik: student.nik,
            nisn: student.nisn,
            jenisKelamin: student.gender ?? 'laki_laki',
            tempatLahir: student.birthPlace,
            tanggalLahir: student.birthDate ? new Date(student.birthDate) : null,
            alamat: student.address,
            provinsi: student.province,
            kota: student.city,
            kecamatan: student.district,
            desa: student.village,
            kodePos: student.postalCode,
            noHp: student.phone,
            anakKe: student.childOrder,
            jumlahSaudara: student.siblingCount,
            riwayatPenyakit: student.medicalHistory,
            sekolahAsal: previousSchool.schoolName,
          },
        },
        profilOrangTua: {
          create: {
            namaAyah: parent.fatherName,
            nikAyah: parent.fatherNik,
            pekerjaanAyah: parent.fatherJob,
            pendidikanAyah: parent.fatherEducation,
            noHpAyah: parent.fatherPhone,
            penghasilanAyah: parent.fatherIncome,
            namaIbu: parent.motherName,
            nikIbu: parent.motherNik,
            pekerjaanIbu: parent.motherJob,
            pendidikanIbu: parent.motherEducation,
            noHpIbu: parent.motherPhone,
            penghasilanIbu: parent.motherIncome,
            namaWali: parent.guardianName,
            hubunganWali: parent.guardianRelation,
            noHpWali: parent.guardianPhone,
            alamatWali: parent.guardianAddress,
            pekerjaanWali: parent.guardianJob,
          },
        },
        sekolahSebelumnya: {
          create: {
            namaSekolah: previousSchool.schoolName ?? '-',
            npsn: previousSchool.npsn,
            alamatSekolah: previousSchool.schoolAddress,
            tahunLulus: previousSchool.graduationYear,
            nomorIjazah: previousSchool.certificateNumber,
          },
        },
      },
      include: {
        profilSantri: true,
        profilOrangTua: true,
        sekolahSebelumnya: true,
      },
    });

    return jsonResponse(
      {
        success: true,
        message: 'Draft pendaftaran berhasil disimpan',
        data: registration,
      },
      200,
    );
  } catch (error) {
    console.error('SAVE_CURRENT_REGISTRATION_ERROR:', error);
    return jsonResponse(
      { success: false, message: 'Terjadi kesalahan pada server' },
      500,
    );
  }
}
