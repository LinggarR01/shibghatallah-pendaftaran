import type { StatusPendaftaran } from '@prisma/client';

const statusStyles: Record<StatusPendaftaran, string> = {
  draft: 'bg-slate-100 text-slate-700 ring-slate-200',
  menunggu_verifikasi: 'bg-amber-50 text-amber-700 ring-amber-200',
  dikirim: 'bg-amber-50 text-amber-700 ring-amber-200',
  sedang_diperiksa: 'bg-sky-50 text-sky-700 ring-sky-200',
  perlu_revisi: 'bg-orange-50 text-orange-700 ring-orange-200',
  diterima: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  ditolak: 'bg-red-50 text-red-700 ring-red-200',
};

const statusLabels: Record<StatusPendaftaran, string> = {
  draft: 'DRAFT',
  menunggu_verifikasi: 'MENUNGGU VERIFIKASI',
  dikirim: 'MENUNGGU VERIFIKASI',
  sedang_diperiksa: 'SEDANG DIPERIKSA',
  perlu_revisi: 'PERLU REVISI',
  diterima: 'DITERIMA',
  ditolak: 'DITOLAK',
};

type StatusBadgeProps = {
  status: StatusPendaftaran;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
