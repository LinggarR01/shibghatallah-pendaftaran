import type { Pendaftaran } from '@prisma/client';

type RegistrationWithParts = Pick<Pendaftaran, 'status'> & {
  profilSantri?: unknown;
  profilOrangTua?: unknown;
  sekolahSebelumnya?: unknown;
};

export const editableRegistrationStatuses = ['draft', 'perlu_revisi'] as const;

export function canEditRegistration(status: Pendaftaran['status']) {
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
