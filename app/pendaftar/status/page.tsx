import Link from 'next/link';
import { redirect } from 'next/navigation';
import StatusBadge from '@/app/components/ui/StatusBadge';
import { getAuthUser } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

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
    <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
        Status Pendaftaran
      </p>
      <h1 className="mt-2 text-2xl font-bold text-slate-950">
        Informasi Status
      </h1>

      {registration ? (
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm text-slate-500">Nomor pendaftaran</p>
            <p className="mt-1 font-bold text-slate-950">
              {registration.nomorPendaftaran}
            </p>
          </div>
          <div>
            <p className="mb-2 text-sm text-slate-500">Status saat ini</p>
            <StatusBadge status={registration.status} />
          </div>
          {registration.catatanAdmin && (
            <div className="rounded-md border border-orange-200 bg-orange-50 p-4">
              <p className="text-sm font-bold text-orange-800">
                Catatan admin
              </p>
              <p className="mt-2 text-sm leading-6 text-orange-800">
                {registration.catatanAdmin}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Anda belum memiliki draft pendaftaran.
        </p>
      )}

      <Link
        href="/dashboard/peserta"
        className="mt-6 inline-flex rounded-md border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        Kembali ke dashboard
      </Link>
    </section>
  );
}
