import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  ShieldCheck,
  UserCheck,
  UserX,
  UsersRound,
} from 'lucide-react';
import StatusBadge from '@/app/components/ui/StatusBadge';
import { getAuthUser } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import type { StatusPendaftaran } from '@/lib/registration';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { StatCard } from '@/app/components/ui/StatCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/Table';

export const dynamic = 'force-dynamic';

type DashboardStat = {
  label: string;
  value: number;
  icon: typeof UsersRound;
  tone: 'green' | 'gold' | 'red' | 'muted';
};

type RecentRegistration = {
  id: bigint;
  nomorPendaftaran: string;
  status: StatusPendaftaran;
  pengguna: {
    nama: string;
    email: string;
    noHp: string | null;
  };
  profilSantri: {
    namaLengkap: string;
    nik: string | null;
  } | null;
};

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
    }) as Promise<RecentRegistration[]>,
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
  const stats: DashboardStat[] = [
    { label: 'Total Pendaftar', value: data.totalPendaftar, icon: UsersRound, tone: 'green' },
    {
      label: 'Menunggu Verifikasi',
      value: data.totalMenungguVerifikasi,
      icon: ShieldCheck,
      tone: 'gold',
    },
    { label: 'Diterima', value: data.totalDiterima, icon: UserCheck, tone: 'green' },
    { label: 'Ditolak', value: data.totalDitolak, icon: UserX, tone: 'red' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard Admin"
        title="Ringkasan Pendaftaran Santri"
        description="Pantau status pendaftaran dan data terbaru yang masuk ke sistem."
        actions={
          <Link
            href="/admin/pendaftar"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover">
            Data Pendaftar
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {stats.map((item) => (
            <StatCard
              key={item.label}
              label={item.label}
              value={item.value}
              icon={item.icon}
              tone={item.tone}
            />
          ))}
        </div>

        <Card className="overflow-hidden">
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-text-muted">
                  Prioritas Verifikasi
                </p>
                <p className="mt-3 text-4xl font-bold tracking-tight text-text-main">
                  {data.totalMenungguVerifikasi + data.totalPerluRevisi}
                </p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-[#8a6507]">
                <AlertTriangle className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-muted">
                    Menunggu
                  </span>
                  <span className="font-bold text-text-main">
                    {data.totalMenungguVerifikasi}
                  </span>
                </div>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#8a6507]">
                    Perlu revisi
                  </span>
                  <span className="font-bold text-[#8a6507]">
                    {data.totalPerluRevisi}
                  </span>
                </div>
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-muted">
                    Draft
                  </span>
                  <span className="font-bold text-text-main">
                    {data.totalDraft}
                  </span>
                </div>
              </div>
            </div>
            <Link
              href="/admin/pendaftar?status=menunggu_verifikasi"
              className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border-soft bg-white text-sm font-semibold text-primary transition hover:bg-surface">
              Buka antrean verifikasi
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border-soft pb-5 sm:pb-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Pendaftar Terbaru</CardTitle>
              <p className="mt-1 text-sm text-text-muted">
                Entri terakhir yang tercatat di database.
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-primary">
              <ClipboardList className="h-5 w-5" />
            </span>
          </div>
        </CardHeader>

        {data.pendaftarTerbaru.length === 0 ? (
          <EmptyState title="Belum ada pendaftar." />
        ) : (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomor</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.pendaftarTerbaru.map((item) => (
                    <TableRow key={item.id.toString()}>
                      <TableCell className="font-semibold text-text-main">
                        {item.nomorPendaftaran}
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-text-main">
                          {item.profilSantri?.namaLengkap ?? item.pengguna.nama}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          {item.pengguna.email}
                        </p>
                      </TableCell>
                      <TableCell className="text-text-muted">
                        {item.pengguna.noHp ?? '-'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/pendaftar/${item.id.toString()}`}
                          className="inline-flex h-9 items-center justify-center rounded-xl border border-border-soft px-3 text-xs font-bold text-primary transition hover:bg-surface">
                          Detail
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
