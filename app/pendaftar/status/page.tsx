import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, CalendarDays, FileText, Route } from 'lucide-react';
import StatusBadge from '@/app/components/ui/StatusBadge';
import { getAuthUser } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { Alert } from '@/app/components/ui/Alert';
import { Card, CardContent } from '@/app/components/ui/Card';
import { PageHeader } from '@/app/components/ui/PageHeader';
import {
  getRegistrationStatusDescription,
  type StatusPendaftaran,
} from '@/lib/registration';

export const dynamic = 'force-dynamic';

function getNextStep(status: StatusPendaftaran) {
  if (status === 'draft') {
    return 'Lengkapi formulir dan dokumen, lalu kirim pendaftaran untuk diverifikasi.';
  }

  if (status === 'perlu_revisi') {
    return 'Baca catatan admin, perbaiki data atau dokumen, lalu kirim kembali.';
  }

  if (
    status === 'menunggu_verifikasi' ||
    status === 'dikirim' ||
    status === 'sedang_diperiksa'
  ) {
    return 'Tunggu proses pemeriksaan admin. Data dan dokumen tidak dapat diubah sementara.';
  }

  if (status === 'diterima') {
    return 'Pendaftaran sudah diterima. Ikuti arahan lanjutan dari pihak pondok.';
  }

  return 'Pendaftaran belum dapat diterima. Hubungi admin jika membutuhkan informasi lebih lanjut.';
}

export default async function StatusPendaftaranPage() {
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect('/masuk-akun');
  }

  const registration = await prisma.pendaftaran.findFirst({
    where: { penggunaId: BigInt(authUser.id) },
    orderBy: { dibuatPada: 'desc' },
  });

  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Status Pendaftaran"
        title="Informasi Status"
        description="Pantau tahap pendaftaran terbaru berdasarkan data yang sudah Anda kirim."
      />

      <Card>
        <CardContent>
          {registration ? (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm text-text-muted">Nomor pendaftaran</p>
                  <p className="mt-1 font-bold text-text-main">
                    {registration.nomorPendaftaran}
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm text-text-muted">Status saat ini</p>
                <StatusBadge status={registration.status} />
                <p className="mt-3 text-sm leading-6 text-text-muted">
                  {getRegistrationStatusDescription(registration.status)}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-surface p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-main">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Terakhir diperbarui
                  </div>
                  <p className="mt-2 text-sm text-text-muted">
                    {registration.diperbaruiPada.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="rounded-xl bg-surface p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-main">
                    <Route className="h-4 w-4 text-primary" />
                    Langkah selanjutnya
                  </div>
                  <p className="mt-2 text-sm leading-6 text-text-muted">
                    {getNextStep(registration.status)}
                  </p>
                </div>
              </div>
              {registration.catatanAdmin && (
                <Alert variant="warning">
                  <p className="font-bold">Perlu Perbaikan</p>
                  <p className="mt-1">{registration.catatanAdmin}</p>
                </Alert>
              )}
            </div>
          ) : (
            <p className="text-sm leading-6 text-text-muted">
              Anda belum memiliki draft pendaftaran.
            </p>
          )}

          <Link
            href="/dashboard/peserta"
            className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border-soft bg-white px-4 text-sm font-semibold text-primary hover:bg-surface">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke dashboard
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
