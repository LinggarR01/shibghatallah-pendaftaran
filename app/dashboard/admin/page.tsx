import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, ClipboardList, UsersRound } from 'lucide-react';
import StatusBadge from '@/app/components/ui/StatusBadge';
import { getAuthUser } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getAdminDashboardData() {
  const [
    totalPendaftar,
    totalDraft,
    totalMenungguVerifikasi,
    totalPerluRevisi,
    totalDiterima,
    totalDitolak,
    pendaftarTerbaru,
  ] = await Promise.all([
    prisma.pendaftaran.count(),
    prisma.pendaftaran.count({ where: { status: 'draft' } }),
    prisma.pendaftaran.count({
      where: { status: { in: ['menunggu_verifikasi', 'dikirim'] } },
    }),
    prisma.pendaftaran.count({ where: { status: 'perlu_revisi' } }),
    prisma.pendaftaran.count({ where: { status: 'diterima' } }),
    prisma.pendaftaran.count({ where: { status: 'ditolak' } }),
    prisma.pendaftaran.findMany({
      take: 6,
      orderBy: { dibuatPada: 'desc' },
      include: {
        pengguna: { select: { nama: true, email: true, noHp: true } },
        profilSantri: { select: { namaLengkap: true, nik: true } },
      },
    }),
  ]);

  return {
    totalPendaftar,
    totalDraft,
    totalMenungguVerifikasi,
    totalPerluRevisi,
    totalDiterima,
    totalDitolak,
    pendaftarTerbaru,
  };
}

export default async function AdminDashboardPage() {
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect('/masuk-akun');
  }

  if (authUser.peran !== 'admin') {
    redirect('/dashboard/peserta');
  }

  const data = await getAdminDashboardData();
  const stats = [
    ['Total Pendaftar', data.totalPendaftar],
    ['DRAFT', data.totalDraft],
    ['MENUNGGU VERIFIKASI', data.totalMenungguVerifikasi],
    ['PERLU REVISI', data.totalPerluRevisi],
    ['DITERIMA', data.totalDiterima],
    ['DITOLAK', data.totalDitolak],
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
              Dashboard Admin
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
              Ringkasan Pendaftaran Santri
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Pantau status pendaftaran dan data terbaru yang masuk ke sistem.
            </p>
          </div>
          <Link
            href="/admin/pendaftar"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
            Data Pendaftar
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(([label, value]) => (
          <div
            key={label}
            className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              Pendaftar Terbaru
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Entri terakhir yang tercatat di database.
            </p>
          </div>
          <UsersRound className="h-5 w-5 text-emerald-700" />
        </div>

        {data.pendaftarTerbaru.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <ClipboardList className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              Belum ada pendaftar.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Nomor</th>
                  <th className="px-5 py-3 font-semibold">Nama</th>
                  <th className="px-5 py-3 font-semibold">Kontak</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.pendaftarTerbaru.map((item) => (
                  <tr key={item.id.toString()}>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {item.nomorPendaftaran}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {item.profilSantri?.namaLengkap ?? item.pengguna.nama}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.pengguna.email}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {item.pengguna.noHp ?? '-'}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
