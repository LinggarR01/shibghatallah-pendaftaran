import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import StatusBadge from '@/app/components/ui/StatusBadge';
import { getAuthUser } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { Alert } from '@/app/components/ui/Alert';
import { Card, CardContent } from '@/app/components/ui/Card';
import { PageHeader } from '@/app/components/ui/PageHeader';

export const dynamic = 'force-dynamic';

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
              </div>
              {registration.catatanAdmin && (
                <Alert variant="warning">
                  <p className="font-bold">Catatan admin</p>
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
