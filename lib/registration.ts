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

export const registrationStatusLabels: Record<StatusPendaftaran, string> = {
  draft: 'Draft',
  menunggu_verifikasi: 'Menunggu Verifikasi',
  dikirim: 'Menunggu Verifikasi',
  sedang_diperiksa: 'Sedang Diperiksa',
  perlu_revisi: 'Perlu Revisi',
  diterima: 'Diterima',
  ditolak: 'Ditolak',
};

export const registrationStatusDescriptions: Record<StatusPendaftaran, string> = {
  draft: 'Data pendaftaran belum dikirim dan masih dapat dilengkapi.',
  menunggu_verifikasi: 'Data pendaftaran sudah dikirim dan sedang menunggu pemeriksaan admin.',
  dikirim: 'Data pendaftaran sudah dikirim dan sedang menunggu pemeriksaan admin.',
  sedang_diperiksa: 'Admin sedang memeriksa data dan dokumen pendaftaran.',
  perlu_revisi: 'Admin meminta perbaikan data atau dokumen pendaftaran.',
  diterima: 'Pendaftaran telah diterima.',
  ditolak: 'Pendaftaran belum dapat diterima.',
};

export function getRegistrationStatusLabel(status: StatusPendaftaran) {
  return registrationStatusLabels[status] ?? status;
}

export function getRegistrationStatusDescription(status: StatusPendaftaran) {
  return registrationStatusDescriptions[status] ?? 'Status pendaftaran terbaru.';
}

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
