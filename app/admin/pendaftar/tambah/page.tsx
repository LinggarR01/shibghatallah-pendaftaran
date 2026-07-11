import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/app/components/ui/PageHeader';
import ManualRegistrationForm from './ManualRegistrationForm';

export const dynamic = 'force-dynamic';

export default function TambahPendaftarManualPage() {
  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Pendaftar / Tambah Pendaftar Manual"
        title="Tambah Pendaftar Manual"
        description="Buat akun dan lengkapi data calon santri yang didaftarkan oleh admin."
        actions={
          <Link
            href="/admin/pendaftar"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border-soft bg-white px-4 text-sm font-semibold text-primary transition hover:bg-surface">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        }
      />

      <ManualRegistrationForm />
    </section>
  );
}
