import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ChangePasswordForm from '@/app/components/auth/ChangePasswordForm';
import { PageHeader } from '@/app/components/ui/PageHeader';

export const dynamic = 'force-dynamic';

export default function PendaftarChangePasswordPage() {
  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Keamanan Akun"
        title="Ganti Password"
        description="Perbarui password akun pendaftar Anda secara aman."
        actions={
          <Link
            href="/dashboard/peserta"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border-soft bg-white px-4 text-sm font-semibold text-primary transition hover:bg-surface">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        }
      />

      <ChangePasswordForm backHref="/dashboard/peserta" />
    </section>
  );
}
