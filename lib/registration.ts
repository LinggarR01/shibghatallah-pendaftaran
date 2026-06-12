export const registrationStatuses = [
  'draft',
  'menunggu_verifikasi',
  'dikirim',
  'sedang_diperiksa',
  'perlu_revisi',
  'diterima',
  'ditolak',
] as const;

export type StatusPendaftaran = (typeof registrationStatuses)[number];

type RegistrationWithParts = {
  status: StatusPendaftaran;
  profilSantri?: unknown;
  profilOrangTua?: unknown;
  sekolahSebelumnya?: unknown;
};

export const editableRegistrationStatuses = ['draft', 'perlu_revisi'] as const;

export function canEditRegistration(status: StatusPendaftaran) {
  return editableRegistrationStatuses.includes(
    status as (typeof editableRegistrationStatuses)[number],
  );
}

export function calculateRegistrationProgress(
  registration: RegistrationWithParts | null,
) {
  if (!registration) {
    return 0;
  }

  const completed = [
    registration.profilSantri,
    registration.profilOrangTua,
    registration.sekolahSebelumnya,
  ].filter(Boolean).length;

  return Math.round((completed / 3) * 100);
}
