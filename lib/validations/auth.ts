import { z } from 'zod';

const requiredString = (message: string) =>
  z.string({ error: message }).trim().min(1, message);

export const registerSchema = z
  .object({
    nama: requiredString('Nama lengkap wajib diisi').max(
      100,
      'Nama lengkap maksimal 100 karakter',
    ),
    email: requiredString('Email wajib diisi')
      .toLowerCase()
      .email('Format email tidak valid')
      .max(100, 'Email maksimal 100 karakter'),
    noHp: requiredString('Nomor HP wajib diisi').max(
      20,
      'Nomor HP maksimal 20 karakter',
    ),
    password: z
      .string({ error: 'Password wajib diisi' })
      .min(8, 'Password minimal 8 karakter'),
    konfirmasiPassword: z.string({
      error: 'Konfirmasi password wajib diisi',
    }),
  })
  .refine((data) => data.password === data.konfirmasiPassword, {
    message: 'Password dan konfirmasi password tidak cocok',
    path: ['konfirmasiPassword'],
  });

export const loginSchema = z.object({
  email: requiredString('Email wajib diisi')
    .toLowerCase()
    .email('Email atau password salah'),
  password: z.string({ error: 'Password wajib diisi' }).min(1, {
    error: 'Password wajib diisi',
  }),
});

export function getFirstValidationMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Data tidak valid';
}
