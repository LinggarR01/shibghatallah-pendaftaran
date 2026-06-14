import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock3,
  FileUp,
  ShieldCheck,
  Trophy,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import StatusBadge from '@/app/components/ui/StatusBadge';
import { getAuthUser } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import {
  calculateRegistrationProgress,
  canEditRegistration,
} from '@/lib/registration';
import { Alert } from '@/app/components/ui/Alert';
import { Badge } from '@/app/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { PageHeader } from '@/app/components/ui/PageHeader';
import type { StatusPendaftaran } from '@/lib/registration';

export const dynamic = 'force-dynamic';

async function getLatestRegistration(penggunaId: bigint) {
  return prisma.pendaftaran.findFirst({
    where: { penggunaId },
    include: {
      profilSantri: true,
      profilOrangTua: true,
      sekolahSebelumnya: true,
      dokumen: { select: { id: true } },
    },
    orderBy: { dibuatPada: 'desc' },
  });
}

type StepState = 'done' | 'current' | 'pending';

const stepStyle: Record<StepState, string> = {
  done: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  current: 'border-amber-200 bg-amber-50 text-[#8a6507]',
  pending: 'border-border-soft bg-white text-text-muted',
};

const stepBadge: Record<StepState, string> = {
  done: 'Selesai',
  current: 'Sedang berjalan',
  pending: 'Belum dilakukan',
};

function getStatusMessage(status?: StatusPendaftaran | null, note?: string | null) {
  if (!status || status === 'draft') {
    return {
      variant: 'default' as const,
      title: 'Lengkapi formulir dan dokumen',
      text: 'Pendaftaran masih berupa draft. Lengkapi data calon santri, orang tua/wali, pendidikan, dan dokumen pendukung.',
    };
  }

  if (status === 'perlu_revisi') {
    return {
      variant: 'warning' as const,
      title: 'Perlu revisi data',
      text: note || 'Periksa kembali catatan admin dan perbarui data pendaftaran.',
    };
  }

  if (status === 'menunggu_verifikasi' || status === 'dikirim' || status === 'sedang_diperiksa') {
    return {
      variant: 'default' as const,
      title: 'Menunggu verifikasi admin',
      text: 'Data pendaftaran sedang diperiksa oleh admin pondok.',
    };
  }

  if (status === 'diterima') {
    return {
      variant: 'success' as const,
      title: 'Pendaftaran diterima',
      text: 'Alhamdulillah, pendaftaran santri telah diterima.',
    };
  }

  return {
    variant: 'destructive' as const,
    title: 'Pendaftaran ditolak',
    text: note || 'Pendaftaran belum dapat diterima. Silakan hubungi admin pondok untuk informasi lanjutan.',
  };
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
  const formComplete = Boolean(
    registration?.profilSantri &&
      registration.profilOrangTua &&
      registration.sekolahSebelumnya,
  );
  const documentsUploaded = (registration?.dokumen.length ?? 0) > 0;
  const status = registration?.status ?? null;
  const isWaiting =
    status === 'menunggu_verifikasi' ||
    status === 'dikirim' ||
    status === 'sedang_diperiksa';
  const isFinal = status === 'diterima' || status === 'ditolak';
  const statusMessage = getStatusMessage(status, registration?.catatanAdmin);

  const steps: Array<{
    title: string;
    description: string;
    icon: LucideIcon;
    state: StepState;
  }> = [
    {
      title: 'Akun dibuat',
      description: 'Akun pendaftar sudah aktif.',
      icon: UserCheck,
      state: 'done' as StepState,
    },
    {
      title: 'Formulir diisi',
      description: 'Data santri dan wali dilengkapi.',
      icon: ClipboardList,
      state: formComplete ? 'done' : 'current',
    },
    {
      title: 'Dokumen diupload',
      description: 'Dokumen persyaratan diunggah.',
      icon: FileUp,
      state: documentsUploaded ? 'done' : formComplete ? 'current' : 'pending',
    },
    {
      title: 'Menunggu verifikasi',
      description: 'Admin memeriksa data pendaftaran.',
      icon: ShieldCheck,
      state: isFinal ? 'done' : isWaiting ? 'current' : 'pending',
    },
    {
      title: 'Hasil pendaftaran',
      description: 'Keputusan penerimaan ditampilkan.',
      icon: Trophy,
      state: isFinal ? 'current' : 'pending',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard Pendaftar"
        title={`Assalamu'alaikum, ${authUser.nama}`}
        description="Pantau alur pendaftaran dan lanjutkan proses yang masih perlu dilengkapi."
        actions={
          <>
            <Link
              href="/pendaftar/formulir"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover">
              {canEdit ? 'Lengkapi Formulir' : 'Lihat Formulir'}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pendaftar/dokumen"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border-soft bg-white px-4 text-sm font-semibold text-primary transition hover:bg-surface">
              Dokumen
            </Link>
          </>
        }
      />

      <Alert variant={statusMessage.variant}>
        <h2 className="font-bold">{statusMessage.title}</h2>
        <p className="mt-1">{statusMessage.text}</p>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Progress Pendaftaran</CardTitle>
              <p className="mt-1 text-sm leading-6 text-text-muted">
                {registration
                  ? `Nomor pendaftaran: ${registration.nomorPendaftaran}`
                  : 'Mulai isi formulir untuk membuat draft pendaftaran.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {registration && <StatusBadge status={registration.status} />}
              <Badge variant="secondary">{progress}% lengkap</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const StateIcon =
                step.state === 'done'
                  ? CheckCircle2
                  : step.state === 'current'
                    ? Clock3
                    : Circle;

              return (
                <div
                  key={step.title}
                  className={`rounded-2xl border p-4 ${stepStyle[step.state]}`}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80">
                      <Icon className="h-5 w-5" />
                    </span>
                    <StateIcon className="h-5 w-5 shrink-0" />
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em]">
                    Langkah {index + 1}
                  </p>
                  <h3 className="mt-1 font-bold leading-snug">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6">{step.description}</p>
                  <Badge
                    variant={
                      step.state === 'done'
                        ? 'success'
                        : step.state === 'current'
                          ? 'gold'
                          : 'outline'
                    }
                    className="mt-4">
                    {stepBadge[step.state]}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
