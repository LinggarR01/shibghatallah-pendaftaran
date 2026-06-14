import Link from 'next/link';
import { Eye, Filter } from 'lucide-react';
import StatusBadge from '@/app/components/ui/StatusBadge';
import { prisma } from '@/lib/prisma';
import {
  registrationStatuses,
  type StatusPendaftaran,
} from '@/lib/registration';
import { buildPendaftaranAdminWhere } from '@/lib/repositories/pendaftaran';
import { Button } from '@/app/components/ui/Button';
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
  pengguna: {
    nama: string;
    email: string;
    noHp: string | null;
  };
  profilSantri: {
    namaLengkap: string;
    nik: string | null;
  } | null;
  sekolahSebelumnya: {
    namaSekolah: string;
  } | null;
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
  const pageParam = Number(getSearchParam(resolvedSearchParams, 'page') ?? '1');
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const status = registrationStatuses.includes(statusParam as StatusPendaftaran)
    ? (statusParam as StatusPendaftaran)
    : undefined;

  const where = buildPendaftaranAdminWhere({ search, status });

  const [registrations, total] = await Promise.all([
    prisma.pendaftaran.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { dibuatPada: 'desc' },
      include: {
        pengguna: { select: { nama: true, email: true, noHp: true } },
        profilSantri: { select: { namaLengkap: true, nik: true } },
        sekolahSebelumnya: { select: { namaSekolah: true } },
      },
    }) as Promise<AdminRegistrationRow[]>,
    prisma.pendaftaran.count({ where }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const queryBase = `search=${encodeURIComponent(search)}&status=${status ?? ''}`;
  const exportParams = new URLSearchParams();

  if (search) exportParams.set('search', search);
  if (status) exportParams.set('status', status);

  const exportQuery = exportParams.toString();
  const exportHref = `/api/admin/export${exportQuery ? `?${exportQuery}` : ''}`;

  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Data Pendaftar"
        title="Kelola Pendaftar"
        description="Cari data santri, filter berdasarkan status, lalu buka detail untuk verifikasi."
        actions={<ExportButton href={exportHref} />}
      />

      <DataTableToolbar
        title="Pencarian dan filter"
        description="Cari berdasarkan nama, email, NIK, nomor HP, atau nomor pendaftaran.">
          <form className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
            <SearchInput
              name="search"
              defaultValue={search}
              placeholder="Cari nama, email, NIK, no HP..."
            />
            <Select name="status" defaultValue={status ?? ''}>
              <option value="">Semua status</option>
              <option value="draft">DRAFT</option>
              <option value="menunggu_verifikasi">MENUNGGU VERIFIKASI</option>
              <option value="perlu_revisi">PERLU REVISI</option>
              <option value="diterima">DITERIMA</option>
              <option value="ditolak">DITOLAK</option>
            </Select>
            <Button type="submit" className="h-11">
              <Filter className="h-4 w-4" />
              Terapkan
            </Button>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor</TableHead>
                  <TableHead>Nama Santri</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Asal Sekolah</TableHead>
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
                      {item.sekolahSebelumnya?.namaSekolah ?? '-'}
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

          {registrations.length === 0 && (
            <EmptyState
              title="Data pendaftar tidak ditemukan."
              description="Coba ubah kata kunci pencarian atau filter status."
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
