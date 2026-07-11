import path from 'node:path';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import type { Prisma } from '@prisma/client';
import { jsonResponse } from '@/lib/api-response';
import {
  createSafeDocumentFileName,
  documentStorageRoot,
  isAllowedDocumentMimeType,
  MAX_DOCUMENT_SIZE,
  type JenisDokumen,
} from '@/lib/documents';
import { prisma } from '@/lib/prisma';
import { generateNomorPendaftaran, getAuthUser } from '@/lib/utils';
import {
  getManualRegistrationValidationMessage,
  manualRegistrationSchema,
  validateManualRegistrationForSubmit,
} from '@/lib/validations/manual-registration';

type TransactionClient = Prisma.TransactionClient;

type PendingDocument = {
  documentType: JenisDokumen;
  file: File;
  buffer: Buffer;
};

class ManualRegistrationRequestError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const manualDocumentTypes = [
  'foto_santri',
  'kartu_keluarga',
  'akta_kelahiran',
  'ijazah',
  'ktp_orang_tua',
  'pas_foto',
  'lainnya',
] as const satisfies readonly JenisDokumen[];

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

async function getOpenPeriodId(tx: TransactionClient) {
  const now = new Date();
  const activePeriod = await tx.periodePendaftaran.findFirst({
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

  const fallbackPeriod = await tx.periodePendaftaran.findFirst({
    where: { status: 'dibuka' },
    orderBy: { tanggalMulai: 'desc' },
  });

  return fallbackPeriod?.id ?? null;
}

async function generateNextRegistrationNumber(tx: TransactionClient) {
  const year = new Date().getFullYear();
  const lastRegistration = await tx.pendaftaran.findFirst({
    where: { nomorPendaftaran: { startsWith: `PSB-${year}` } },
    orderBy: { id: 'desc' },
  });
  const lastNumber = lastRegistration
    ? Number(lastRegistration.nomorPendaftaran.split('-')[2])
    : 0;

  return generateNomorPendaftaran(lastNumber + 1);
}

function isManualDocumentType(value: string): value is JenisDokumen {
  return manualDocumentTypes.includes(value as (typeof manualDocumentTypes)[number]);
}

async function cleanupStoredFiles(filePaths: string[]) {
  await Promise.all(
    filePaths.map(async (filePath) => {
      try {
        await unlink(filePath);
      } catch {
        // Cleanup is best-effort because the database transaction is already rolled back.
      }
    }),
  );
}

async function parseManualRegistrationRequest(request: NextRequest) {
  const contentType = request.headers.get('content-type') ?? '';

  if (!contentType.includes('multipart/form-data')) {
    return {
      body: await request.json(),
      documents: [] as PendingDocument[],
    };
  }

  const formData = await request.formData();
  const payload = formData.get('payload');

  if (typeof payload !== 'string') {
    throw new ManualRegistrationRequestError(
      'Mohon lengkapi data yang wajib diisi.',
    );
  }

  let body: unknown;

  try {
    body = JSON.parse(payload);
  } catch {
    throw new ManualRegistrationRequestError(
      'Terjadi kesalahan. Silakan coba lagi.',
    );
  }

  const documents: PendingDocument[] = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('document:')) continue;
    if (!(value instanceof File) || value.size === 0) continue;

    const documentType = key.slice('document:'.length);

    if (!isManualDocumentType(documentType)) {
      throw new ManualRegistrationRequestError('Jenis dokumen tidak valid.');
    }

    if (!isAllowedDocumentMimeType(value.type)) {
      throw new ManualRegistrationRequestError(
        'File harus PDF, JPG, JPEG, atau PNG.',
      );
    }

    if (value.size > MAX_DOCUMENT_SIZE) {
      throw new ManualRegistrationRequestError('Ukuran file maksimal 5 MB.');
    }

    documents.push({
      documentType,
      file: value,
      buffer: Buffer.from(await value.arrayBuffer()),
    });
  }

  return { body, documents };
}

export async function POST(request: NextRequest) {
  const writtenDocumentPaths: string[] = [];

  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return jsonResponse(
        { success: false, message: 'Anda harus login terlebih dahulu' },
        401,
      );
    }

    if (authUser.peran !== 'admin') {
      return jsonResponse(
        {
          success: false,
          message: 'Anda tidak memiliki izin untuk melakukan aksi ini.',
        },
        403,
      );
    }

    const { body, documents } = await parseManualRegistrationRequest(request);
    const parsedBody = manualRegistrationSchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonResponse(
        {
          success: false,
          message: getManualRegistrationValidationMessage(parsedBody.error),
          errors: parsedBody.error.flatten().fieldErrors,
        },
        400,
      );
    }

    const submitErrors = validateManualRegistrationForSubmit(parsedBody.data);

    if (submitErrors.length > 0) {
      return jsonResponse(
        {
          success: false,
          message: submitErrors[0] ?? 'Mohon lengkapi data wajib.',
          errors: submitErrors,
        },
        400,
      );
    }

    const registration = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.pengguna.findUnique({
        where: { email: parsedBody.data.account.email },
        select: { id: true },
      });

      if (existingUser) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }

      const existingNik = await tx.profilSantri.findFirst({
        where: { nik: parsedBody.data.student.nik },
        select: { id: true },
      });

      if (existingNik) {
        throw new Error('NIK_ALREADY_EXISTS');
      }

      const periodeId = await getOpenPeriodId(tx);

      if (!periodeId) {
        throw new Error('OPEN_PERIOD_NOT_FOUND');
      }

      const hashedPassword = await bcrypt.hash(
        parsedBody.data.account.password,
        10,
      );
      const nomorPendaftaran = await generateNextRegistrationNumber(tx);
      const { account, student, parent, previousSchool } = parsedBody.data;
      const { status, catatanAdmin } = parsedBody.data.registration;
      const isSubmittedStatus = status !== 'draft';
      const isFinalStatus = status === 'diterima' || status === 'ditolak';
      const pengguna = await tx.pengguna.create({
        data: {
          nama: account.nama,
          email: account.email,
          password: hashedPassword,
          noHp: account.noHp,
          peran: 'pendaftar',
        },
        select: { id: true, nama: true, email: true, noHp: true, peran: true },
      });

      const createdRegistration = await tx.pendaftaran.create({
        data: {
          penggunaId: pengguna.id,
          periodeId,
          nomorPendaftaran,
          status,
          catatanAdmin,
          dikirimPada: isSubmittedStatus ? new Date() : null,
          diverifikasiPada: isFinalStatus ? new Date() : null,
          profilSantri: {
            create: {
              namaLengkap: student.fullName,
              nik: student.nik,
              nisn: student.nisn,
              jenisKelamin: student.gender,
              tempatLahir: student.birthPlace,
              tanggalLahir: new Date(student.birthDate),
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
              nikWali: parent.guardianNik,
              hubunganWali: parent.guardianRelation,
              noHpWali: parent.guardianPhone,
              alamatWali: parent.guardianAddress,
              pekerjaanWali: parent.guardianJob,
              pendidikanWali: parent.guardianEducation,
              alamatOrangTua: parent.parentAddress,
            },
          },
          sekolahSebelumnya: {
            create: {
              namaSekolah: previousSchool.schoolName,
              npsn: previousSchool.npsn,
              alamatSekolah: previousSchool.schoolAddress,
              tahunLulus: previousSchool.graduationYear,
              nomorIjazah: previousSchool.certificateNumber,
            },
          },
        },
        include: {
          pengguna: { select: { nama: true, email: true, noHp: true, peran: true } },
          profilSantri: true,
          profilOrangTua: true,
          sekolahSebelumnya: true,
        },
      });

      if (documents.length > 0) {
        await mkdir(documentStorageRoot, { recursive: true });

        for (const document of documents) {
          const safeFileName = createSafeDocumentFileName(
            createdRegistration.id,
            document.documentType,
            document.file.type,
          );
          const absolutePath = path.join(documentStorageRoot, safeFileName);
          const relativePath = path.relative(process.cwd(), absolutePath);

          await writeFile(absolutePath, document.buffer);
          writtenDocumentPaths.push(absolutePath);

          await tx.dokumenPendaftaran.create({
            data: {
              pendaftaranId: createdRegistration.id,
              jenisDokumen: document.documentType,
              namaFile: safeFileName,
              lokasiFile: relativePath,
              tipeFile: document.file.type,
              ukuranFile: BigInt(document.file.size),
            },
          });
        }
      }

      return createdRegistration;
    });

    return jsonResponse(
      {
        success: true,
        message:
          documents.length > 0
            ? 'Pendaftar, akun, dan dokumen berhasil dibuat.'
            : 'Pendaftar dan akun berhasil dibuat.',
        data: {
          id: registration.id.toString(),
          nomorPendaftaran: registration.nomorPendaftaran,
          pengguna: registration.pengguna,
          documentCount: documents.length,
        },
      },
      201,
    );
  } catch (error) {
    if (writtenDocumentPaths.length > 0) {
      await cleanupStoredFiles(writtenDocumentPaths);
    }

    if (error instanceof ManualRegistrationRequestError) {
      return jsonResponse(
        { success: false, message: error.message },
        error.status,
      );
    }

    if (error instanceof Error) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return jsonResponse(
          { success: false, message: 'Email sudah terdaftar.' },
          400,
        );
      }

      if (error.message === 'NIK_ALREADY_EXISTS') {
        return jsonResponse(
          { success: false, message: 'NIK sudah digunakan.' },
          400,
        );
      }

      if (error.message === 'OPEN_PERIOD_NOT_FOUND') {
        return jsonResponse(
          {
            success: false,
            message: 'Periode pendaftaran aktif belum tersedia.',
          },
          400,
        );
      }
    }

    if (isUniqueConstraintError(error)) {
      return jsonResponse(
        { success: false, message: 'Email sudah terdaftar.' },
        400,
      );
    }

    console.error('CREATE_MANUAL_REGISTRATION_ERROR:', error);
    return jsonResponse(
      { success: false, message: 'Terjadi kesalahan pada server' },
      500,
    );
  }
}
