import { z } from 'zod';
import {
  type RegistrationDraftInput,
  validateRegistrationForSubmit,
} from './registration';

const manualRegistrationStatuses = [
  'draft',
  'menunggu_verifikasi',
  'perlu_revisi',
  'diterima',
  'ditolak',
] as const;

const requiredText = (message: string, max = 255) =>
  z.string({ error: message }).trim().min(1, message).max(max, `Maksimal ${max} karakter`);

const optionalText = (max = 255) =>
  z
    .string()
    .trim()
    .max(max, `Maksimal ${max} karakter`)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null));

const optionalNumber = z
  .union([z.number(), z.string()])
  .optional()
  .nullable()
  .transform((value) => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  });

export const manualRegistrationSchema = z
  .object({
    account: z
      .object({
        nama: requiredText('Nama akun wajib diisi', 100),
        email: requiredText('Email wajib diisi', 100)
          .toLowerCase()
          .email('Format email tidak valid'),
        noHp: optionalText(20),
        password: z
          .string({ error: 'Password wajib diisi' })
          .min(8, 'Password minimal 8 karakter'),
        konfirmasiPassword: z.string({
          error: 'Konfirmasi password wajib diisi',
        }),
      })
      .refine((data) => data.password === data.konfirmasiPassword, {
        message: 'Password dan konfirmasi password tidak sama.',
        path: ['konfirmasiPassword'],
      }),
    student: z.object({
      fullName: requiredText('Nama lengkap santri wajib diisi', 100),
      nik: requiredText('NIK santri wajib diisi', 30),
      nisn: optionalText(30),
      gender: z.enum(['laki_laki', 'perempuan'], {
        error: 'Jenis kelamin wajib dipilih',
      }),
      birthPlace: requiredText('Tempat lahir wajib diisi', 100),
      birthDate: requiredText('Tanggal lahir wajib diisi', 20).refine(
        (value) => !Number.isNaN(new Date(value).getTime()),
        'Tanggal lahir tidak valid',
      ),
      address: requiredText('Alamat lengkap wajib diisi', 2000),
      province: optionalText(100),
      city: optionalText(100),
      district: optionalText(100),
      village: optionalText(100),
      postalCode: optionalText(10),
      phone: optionalText(20),
      childOrder: optionalNumber,
      siblingCount: optionalNumber,
      medicalHistory: optionalText(2000),
    }),
    parent: z.object({
      fatherName: requiredText('Nama ayah wajib diisi', 100),
      fatherNik: optionalText(30),
      fatherJob: optionalText(100),
      fatherEducation: optionalText(50),
      fatherPhone: optionalText(20),
      fatherIncome: optionalText(100),
      motherName: requiredText('Nama ibu wajib diisi', 100),
      motherNik: optionalText(30),
      motherJob: optionalText(100),
      motherEducation: optionalText(50),
      motherPhone: optionalText(20),
      motherIncome: optionalText(100),
      guardianName: optionalText(100),
      guardianNik: optionalText(30),
      guardianRelation: optionalText(50),
      guardianPhone: optionalText(20),
      guardianAddress: optionalText(2000),
      guardianJob: optionalText(100),
      guardianEducation: optionalText(50),
      parentAddress: optionalText(2000),
    }),
    previousSchool: z.object({
      schoolName: requiredText('Asal sekolah wajib diisi', 150),
      npsn: optionalText(30),
      schoolAddress: optionalText(2000),
      graduationYear: optionalText(10),
      certificateNumber: optionalText(100),
    }),
    registration: z.object({
      status: z.enum(manualRegistrationStatuses, {
        error: 'Status pendaftaran tidak valid',
      }),
      catatanAdmin: optionalText(2000),
    }),
  })
  .superRefine((data, context) => {
    if (!/^\d{16}$/.test(data.student.nik)) {
      context.addIssue({
        code: 'custom',
        message: 'NIK harus terdiri dari 16 digit angka.',
        path: ['student', 'nik'],
      });
    }

    if (data.student.nisn && !/^\d{10}$/.test(data.student.nisn)) {
      context.addIssue({
        code: 'custom',
        message: 'NISN harus terdiri dari 10 digit angka.',
        path: ['student', 'nisn'],
      });
    }

    if (new Date(data.student.birthDate) > new Date()) {
      context.addIssue({
        code: 'custom',
        message: 'Tanggal lahir tidak boleh di masa depan.',
        path: ['student', 'birthDate'],
      });
    }

    if (data.student.childOrder !== null && data.student.childOrder !== undefined && data.student.childOrder < 1) {
      context.addIssue({
        code: 'custom',
        message: 'Anak ke- minimal 1.',
        path: ['student', 'childOrder'],
      });
    }

    if (data.student.siblingCount !== null && data.student.siblingCount !== undefined && data.student.siblingCount < 0) {
      context.addIssue({
        code: 'custom',
        message: 'Jumlah saudara minimal 0.',
        path: ['student', 'siblingCount'],
      });
    }

    if (data.student.postalCode && !/^\d{1,5}$/.test(data.student.postalCode)) {
      context.addIssue({
        code: 'custom',
        message: 'Kode pos maksimal 5 digit angka.',
        path: ['student', 'postalCode'],
      });
    }

    if (
      data.previousSchool.graduationYear &&
      !/^(19|20)\d{2}$/.test(data.previousSchool.graduationYear)
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Tahun lulus harus berupa tahun yang valid.',
        path: ['previousSchool', 'graduationYear'],
      });
    }

    if (
      !data.parent.fatherPhone &&
      !data.parent.motherPhone &&
      !data.parent.guardianPhone
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Nomor HP ayah, ibu, atau wali wajib diisi salah satu',
        path: ['parent', 'fatherPhone'],
      });
    }

    if (
      data.registration.status === 'perlu_revisi' &&
      !data.registration.catatanAdmin
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Catatan admin wajib diisi saat status PERLU_REVISI',
        path: ['registration', 'catatanAdmin'],
      });
    }
  });

export type ManualRegistrationInput = z.infer<typeof manualRegistrationSchema>;
export type ManualRegistrationStatus =
  (typeof manualRegistrationStatuses)[number];

export function toRegistrationDraftInput(
  input: ManualRegistrationInput,
): RegistrationDraftInput {
  return {
    student: input.student,
    parent: {
      fatherName: input.parent.fatherName,
      fatherNik: input.parent.fatherNik,
      fatherJob: input.parent.fatherJob,
      fatherEducation: input.parent.fatherEducation,
      fatherPhone: input.parent.fatherPhone,
      fatherIncome: input.parent.fatherIncome,
      motherName: input.parent.motherName,
      motherNik: input.parent.motherNik,
      motherJob: input.parent.motherJob,
      motherEducation: input.parent.motherEducation,
      motherPhone: input.parent.motherPhone,
      motherIncome: input.parent.motherIncome,
      guardianName: input.parent.guardianName,
      guardianRelation: input.parent.guardianRelation,
      guardianPhone: input.parent.guardianPhone,
      guardianAddress: input.parent.guardianAddress,
      guardianJob: input.parent.guardianJob,
    },
    previousSchool: input.previousSchool,
  };
}

export function getManualRegistrationValidationMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Mohon lengkapi data wajib.';
}

export function validateManualRegistrationForSubmit(
  input: ManualRegistrationInput,
) {
  return validateRegistrationForSubmit(toRegistrationDraftInput(input));
}
