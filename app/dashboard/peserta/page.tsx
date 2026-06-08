import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertCircle, ArrowRight, CheckCircle2, ClipboardList } from 'lucide-react';
import StatusBadge from '@/app/components/ui/StatusBadge';
import { getAuthUser } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import {
  calculateRegistrationProgress,
  canEditRegistration,
} from '@/lib/registration';

export const dynamic = 'force-dynamic';

async function getLatestRegistration(penggunaId: bigint) {
  return prisma.pendaftaran.findFirst({
    where: { penggunaId },
    include: {
      profilSantri: true,
      profilOrangTua: true,
      sekolahSebelumnya: true,
    },
    orderBy: { dibuatPada: 'desc' },
  });
}

export default async function PesertaDashboardPage() {
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect('/masuk-akun');
  }

  if (authUser.peran !== 'pendaftar') {
    redirect('/dashboard/admin');
  }

  const registration = await getLatestRegistration(BigInt(authUser.id));
  const progress = calculateRegistrationProgress(registration);
  const canEdit = !registration || canEditRegistration(registration.status);

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
              Dashboard Pendaftar
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
              Assalamu&apos;alaikum, {authUser.nama}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Lengkapi data pendaftaran dan pantau status verifikasi dari admin.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pendaftar/formulir"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
              {canEdit ? 'Lanjut Isi Formulir' : 'Lihat Formulir'}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pendaftar/status"
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Status Pendaftaran
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Status Pendaftaran
          </p>
          <div className="mt-4">
            {registration ? (
              <StatusBadge status={registration.status} />
            ) : (
              <span className="text-sm font-semibold text-slate-700">
                Belum mulai
              </span>
            )}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {registration
              ? `Nomor ${registration.nomorPendaftaran}`
              : 'Mulai isi formulir untuk membuat draft pendaftaran.'}
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Progress Kelengkapan Data
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {progress}%
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
            <span>
              Santri: {registration?.profilSantri ? 'Lengkap' : 'Belum'}
            </span>
            <span>
              Orang tua: {registration?.profilOrangTua ? 'Lengkap' : 'Belum'}
            </span>
            <span>
              Pendidikan:{' '}
              {registration?.sekolahSebelumnya ? 'Lengkap' : 'Belum'}
            </span>
          </div>
        </div>
      </section>

      {registration?.status === 'perlu_revisi' && registration.catatanAdmin && (
        <section className="rounded-md border border-orange-200 bg-orange-50 p-5 text-orange-800">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h2 className="font-bold">Catatan revisi dari admin</h2>
              <p className="mt-2 text-sm leading-6">{registration.catatanAdmin}</p>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <ClipboardList className="mt-1 h-5 w-5 text-emerald-700" />
          <div>
            <h2 className="text-base font-bold text-slate-950">
              Langkah Berikutnya
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Simpan draft saat mengisi data. Setelah data santri, orang
              tua/wali, dan pendidikan sebelumnya lengkap, kirim pendaftaran
              untuk masuk antrean verifikasi.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
