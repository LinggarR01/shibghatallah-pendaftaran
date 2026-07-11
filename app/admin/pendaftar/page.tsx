import Link from 'next/link';
import { Eye, Filter, RotateCcw, UserPlus } from 'lucide-react';
import StatusBadge from '@/app/components/ui/StatusBadge';
import { prisma } from '@/lib/prisma';
import {
  registrationStatuses,
  type StatusPendaftaran,
} from '@/lib/registration';
import { buildPendaftaranAdminWhere } from '@/lib/repositories/pendaftaran';
import { Button } from '@/app/components/ui/Button';
import { Alert } from '@/app/components/ui/Alert';
import { Card, CardContent } from '@/app/components/ui/Card';
import { DataTableToolbar } from '@/app/components/ui/DataTableToolbar';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Pagination } from '@/app/components/ui/Pagination';
import { SearchInput } from '@/app/components/ui/SearchInput';
import { Select } from '@/app/components/ui/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/Table';
import { ExportButton } from './ExportButton';

export const dynamic = 'force-dynamic';

const pageSize = 10;

type AdminPendaftarPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type AdminRegistrationRow = {
  id: bigint;
  nomorPendaftaran: string;
  status: StatusPendaftaran;
  dibuatPada: Date;
  pengguna: {
    nama: string;
    email: string;
    noHp: string | null;
  };
  periode: {
    id: bigint;
    nama: string;
    tahunAjaran: string;
  };
  profilSantri: {
    namaLengkap: string;
    nik: string | null;
  } | null;
  profilOrangTua: {
    id: bigint;
  } | null;
  sekolahSebelumnya: {
    namaSekolah: string;
  } | null;
  _count: {
    dokumen: number;
  };
};

function getSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminPendaftarPage({
  searchParams,
}: AdminPendaftarPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const search = getSearchParam(resolvedSearchParams, 'search')?.trim() ?? '';
  const statusParam = getSearchParam(resolvedSearchParams, 'status') ?? '';
  const periodeParam = getSearchParam(resolvedSearchParams, 'periode') ?? '';
  const createdParam = getSearchParam(resolvedSearchParams, 'created');
  const created = createdParam === '1' || createdParam === 'documents';
  const pageParam = Number(getSearchParam(resolvedSearchParams, 'page') ?? '1');
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const status = registrationStatuses.includes(statusParam as StatusPendaftaran)
    ? (statusParam as StatusPendaftaran)
    : undefined;
  let periodeId: bigint | undefined;

  if (periodeParam) {
    try {
      periodeId = BigInt(periodeParam);
    } catch {
      periodeId = undefined;
    }
  }

  const where = buildPendaftaranAdminWhere({ search, status, periodeId });

  const [registrations, total, periods] = await Promise.all([
    prisma.pendaftaran.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { dibuatPada: 'desc' },
      include: {
        pengguna: { select: { nama: true, email: true, noHp: true } },
        periode: { select: { id: true, nama: true, tahunAjaran: true } },
        profilSantri: { select: { namaLengkap: true, nik: true } },
        profilOrangTua: { select: { id: true } },
        sekolahSebelumnya: { select: { namaSekolah: true } },
        _count: { select: { dokumen: true } },
      },
    }) as Promise<AdminRegistrationRow[]>,
    prisma.pendaftaran.count({ where }),
    prisma.periodePendaftaran.findMany({
      orderBy: { tanggalMulai: 'desc' },
      select: { id: true, nama: true, tahunAjaran: true },
    }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const queryBase = `search=${encodeURIComponent(search)}&status=${status ?? ''}&periode=${periodeParam}`;
  const exportParams = new URLSearchParams();
  const hasFilters = Boolean(search || status || periodeParam);

  if (search) exportParams.set('search', search);
  if (status) exportParams.set('status', status);

  const exportQuery = exportParams.toString();
  const exportHref = `/api/admin/export${exportQuery ? `?${exportQuery}` : ''}`;

  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Data Pendaftar"
        title="Data Pendaftar"
        description="Kelola data, status, dokumen, dan proses verifikasi pendaftaran calon santri."
        actions={
          <>
            <Link
              href="/admin/pendaftar/tambah"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border-soft bg-white px-4 text-sm font-semibold text-primary transition hover:bg-surface">
              <UserPlus className="h-4 w-4" />
              Tambah Pendaftar Manual
            </Link>
            <ExportButton href={exportHref} />
          </>
        }
      />

      {created && (
        <Alert variant="success">
          {createdParam === 'documents'
            ? 'Pendaftar, akun, dan dokumen berhasil dibuat.'
            : 'Pendaftar dan akun berhasil dibuat.'}
        </Alert>
      )}

      <DataTableToolbar
        title="Pencarian dan filter"
        description="Cari berdasarkan nama, email, NIK, nomor HP, atau nomor pendaftaran.">
          <form className="grid gap-3 lg:grid-cols-[1fr_210px_210px_auto_auto]">
            <SearchInput
              name="search"
              defaultValue={search}
              placeholder="Cari nama, email, NIK, no HP..."
            />
            <Select name="periode" defaultValue={periodeParam}>
              <option value="">Semua periode</option>
              {periods.map((period) => (
                <option key={period.id.toString()} value={period.id.toString()}>
                  {period.nama} - {period.tahunAjaran}
                </option>
              ))}
            </Select>
            <Select name="status" defaultValue={status ?? ''}>
              <option value="">Semua status</option>
              <option value="draft">Draft</option>
              <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
              <option value="perlu_revisi">Perlu Revisi</option>
              <option value="diterima">Diterima</option>
              <option value="ditolak">Ditolak</option>
            </Select>
            <Button type="submit" className="h-11">
              <Filter className="h-4 w-4" />
              Terapkan
            </Button>
            {hasFilters && (
              <Link
                href="/admin/pendaftar"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border-soft bg-white px-4 text-sm font-semibold text-primary transition hover:bg-surface">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Link>
            )}
          </form>
      </DataTableToolbar>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-border-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-text-main">Daftar Pendaftar</h2>
            <p className="mt-1 text-sm text-text-muted">
              Menampilkan {registrations.length} dari {total} data.
            </p>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor</TableHead>
                  <TableHead>Nama Santri</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Kelengkapan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((item) => (
                  <TableRow key={item.id.toString()}>
                    <TableCell className="font-semibold text-text-main">
                      {item.nomorPendaftaran}
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-text-main">
                        {item.profilSantri?.namaLengkap ?? item.pengguna.nama}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {item.profilSantri?.nik ?? '-'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p>{item.pengguna.email}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {item.pengguna.noHp ?? '-'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p>{item.periode.nama}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {item.periode.tahunAjaran} -{' '}
                        {item.dibuatPada.toLocaleDateString('id-ID')}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {item.profilSantri &&
                        item.profilOrangTua &&
                        item.sekolahSebelumnya
                          ? 'Data lengkap'
                          : 'Data belum lengkap'}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {item._count.dokumen} dokumen
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/pendaftar/${item.id.toString()}`}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border-soft bg-white px-3 text-xs font-semibold text-primary transition hover:bg-surface">
                        <Eye className="h-4 w-4" />
                        Detail
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 p-4 md:hidden">
            {registrations.map((item) => (
              <article
                key={item.id.toString()}
                className="rounded-xl border border-border-soft bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-text-muted">
                      {item.nomorPendaftaran}
                    </p>
                    <h2 className="mt-1 truncate font-bold text-text-main">
                      {item.profilSantri?.namaLengkap ?? item.pengguna.nama}
                    </h2>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <dl className="mt-4 grid gap-3 text-sm">
                  <div>
                    <dt className="font-semibold text-text-main">Akun</dt>
                    <dd className="text-text-muted">{item.pengguna.email}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-text-main">Periode</dt>
                    <dd className="text-text-muted">
                      {item.periode.nama} - {item.periode.tahunAjaran}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-text-main">Kelengkapan</dt>
                    <dd className="text-text-muted">
                      {item.profilSantri &&
                      item.profilOrangTua &&
                      item.sekolahSebelumnya
                        ? 'Data lengkap'
                        : 'Data belum lengkap'}{' '}
                      - {item._count.dokumen} dokumen
                    </dd>
                  </div>
                </dl>
                <Link
                  href={`/admin/pendaftar/${item.id.toString()}`}
                  className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border-soft bg-white px-3 text-sm font-semibold text-primary transition hover:bg-surface">
                  <Eye className="h-4 w-4" />
                  Lihat Detail
                </Link>
              </article>
            ))}
          </div>

          {registrations.length === 0 && (
            <EmptyState
              title={
                hasFilters
                  ? 'Tidak ada pendaftar yang sesuai dengan pencarian atau filter.'
                  : 'Belum ada data pendaftar.'
              }
              description={
                hasFilters
                  ? 'Coba reset filter atau gunakan kata kunci lain.'
                  : 'Tambahkan pendaftar manual untuk mulai mengelola data.'
              }
              action={
                hasFilters ? (
                  <Link
                    href="/admin/pendaftar"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border-soft bg-white px-4 text-sm font-semibold text-primary hover:bg-surface">
                    <RotateCcw className="h-4 w-4" />
                    Reset Filter
                  </Link>
                ) : (
                  <Link
                    href="/admin/pendaftar/tambah"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover">
                    <UserPlus className="h-4 w-4" />
                    Tambah Pendaftar Manual
                  </Link>
                )
              }
            />
          )}

          <Pagination
            page={page}
            pageCount={pageCount}
            total={total}
            previousHref={`/admin/pendaftar?${queryBase}&page=${Math.max(1, page - 1)}`}
            nextHref={`/admin/pendaftar?${queryBase}&page=${Math.min(pageCount, page + 1)}`}
          />
        </CardContent>
      </Card>
    </section>
  );
}
