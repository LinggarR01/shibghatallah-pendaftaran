import {
  getRegistrationStatusLabel,
  type StatusPendaftaran,
} from '@/lib/registration';
import { Badge } from './Badge';

const statusStyles: Record<StatusPendaftaran, string> = {
  draft: 'bg-slate-50 text-slate-700 ring-1 ring-slate-200',
  menunggu_verifikasi: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  dikirim: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  sedang_diperiksa: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  perlu_revisi: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  diterima: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  ditolak: 'bg-red-50 text-red-700 ring-1 ring-red-200',
};

type StatusBadgeProps = {
  status: StatusPendaftaran;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge className={statusStyles[status]}>
      {getRegistrationStatusLabel(status)}
    </Badge>
  );
}
