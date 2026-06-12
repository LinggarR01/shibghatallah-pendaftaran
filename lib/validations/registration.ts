import { z } from 'zod';

const genderTypes = ['laki_laki', 'perempuan'] as const;

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

export const registrationDraftSchema = z.object({
  student: z.object({
    fullName: optionalText(100),
    nik: optionalText(30),
    nisn: optionalText(30),
    gender: z
      .enum(genderTypes)
      .optional()
      .nullable()
      .transform((value) => value ?? null),
    birthPlace: optionalText(100),
    birthDate: optionalText(20),
    address: optionalText(2000),
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
    fatherName: optionalText(100),
    fatherNik: optionalText(30),
    fatherJob: optionalText(100),
    fatherEducation: optionalText(50),
    fatherPhone: optionalText(20),
    fatherIncome: optionalText(100),
    motherName: optionalText(100),
    motherNik: optionalText(30),
    motherJob: optionalText(100),
    motherEducation: optionalText(50),
    motherPhone: optionalText(20),
    motherIncome: optionalText(100),
    guardianName: optionalText(100),
    guardianRelation: optionalText(50),
    guardianPhone: optionalText(20),
    guardianAddress: optionalText(2000),
    guardianJob: optionalText(100),
  }),
  previousSchool: z.object({
    schoolName: optionalText(150),
    npsn: optionalText(30),
    schoolAddress: optionalText(2000),
    graduationYear: optionalText(10),
    certificateNumber: optionalText(100),
  }),
});

export type RegistrationDraftInput = z.infer<typeof registrationDraftSchema>;

export function validateRegistrationForSubmit(input: RegistrationDraftInput) {
  const errors: string[] = [];

  if (!input.student.fullName) errors.push('Nama lengkap santri wajib diisi');
  if (!input.student.nik) errors.push('NIK santri wajib diisi');
  if (input.student.nik && !/^\d{16}$/.test(input.student.nik)) {
    errors.push('NIK santri harus 16 digit');
  }
  if (!input.student.gender) errors.push('Jenis kelamin wajib dipilih');
  if (!input.student.birthPlace) errors.push('Tempat lahir wajib diisi');
  if (!input.student.birthDate) errors.push('Tanggal lahir wajib diisi');
  if (!input.student.address) errors.push('Alamat lengkap wajib diisi');

  if (!input.parent.fatherName) errors.push('Nama ayah wajib diisi');
  if (!input.parent.motherName) errors.push('Nama ibu wajib diisi');
  if (
    !input.parent.fatherPhone &&
    !input.parent.motherPhone &&
    !input.parent.guardianPhone
  ) {
    errors.push('Nomor HP ayah, ibu, atau wali wajib diisi salah satu');
  }

  if (!input.previousSchool.schoolName) {
    errors.push('Asal sekolah wajib diisi');
  }

  return errors;
}

export function getFirstRegistrationValidationMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Data pendaftaran tidak valid';
}
