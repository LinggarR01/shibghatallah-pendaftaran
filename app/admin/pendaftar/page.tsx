import Link from 'next/link';
import StatusBadge from '@/app/components/ui/StatusBadge';
import { prisma } from '@/lib/prisma';
import {
  registrationStatuses,
  type StatusPendaftaran,
} from '@/lib/registration';

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

  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { nomorPendaftaran: { contains: search } },
            { pengguna: { nama: { contains: search } } },
            { pengguna: { email: { contains: search } } },
            { pengguna: { noHp: { contains: search } } },
            { profilSantri: { namaLengkap: { contains: search } } },
            { profilSantri: { nik: { contains: search } } },
          ],
        }
      : {}),
  };

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

  return (
    <section className="space-y-5">
      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
          Data Pendaftar
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">
          Kelola Pendaftar
        </h1>
        <form className="mt-5 grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <input
            name="search"
            defaultValue={search}
            placeholder="Cari nama, email, NIK, no HP..."
            className="rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
          />
          <select
            name="status"
            defaultValue={status ?? ''}
            className="rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10">
            <option value="">Semua status</option>
            <option value="draft">DRAFT</option>
            <option value="menunggu_verifikasi">MENUNGGU VERIFIKASI</option>
            <option value="perlu_revisi">PERLU REVISI</option>
            <option value="diterima">DITERIMA</option>
            <option value="ditolak">DITOLAK</option>
          </select>
          <button className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
            Terapkan
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Nomor</th>
                <th className="px-5 py-3 font-semibold">Nama Santri</th>
                <th className="px-5 py-3 font-semibold">Kontak</th>
                <th className="px-5 py-3 font-semibold">Asal Sekolah</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registrations.map((item) => (
                <tr key={item.id.toString()}>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {item.nomorPendaftaran}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {item.profilSantri?.namaLengkap ?? item.pengguna.nama}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.profilSantri?.nik ?? '-'}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p>{item.pengguna.email}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.pengguna.noHp ?? '-'}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    {item.sekolahSebelumnya?.namaSekolah ?? '-'}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/pendaftar/${item.id.toString()}`}
                      className="font-semibold text-emerald-700 hover:text-emerald-900">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {registrations.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-slate-600">
            Data pendaftar tidak ditemukan.
          </p>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm">
          <span className="text-slate-600">
            Halaman {page} dari {pageCount} · Total {total}
          </span>
          <div className="flex gap-2">
            <Link
              href={`/admin/pendaftar?search=${encodeURIComponent(search)}&status=${status ?? ''}&page=${Math.max(1, page - 1)}`}
              className="rounded-md border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50">
              Sebelumnya
            </Link>
            <Link
              href={`/admin/pendaftar?search=${encodeURIComponent(search)}&status=${status ?? ''}&page=${Math.min(pageCount, page + 1)}`}
              className="rounded-md border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50">
              Berikutnya
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
