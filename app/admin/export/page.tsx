import { FileDown } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/Card';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { ExportButton } from '../pendaftar/ExportButton';

export default function AdminExportPage() {
  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Export Data"
        title="Laporan dan Export"
        description="Area laporan admin untuk kebutuhan rekapitulasi pendaftaran."
        actions={<ExportButton href="/api/admin/export" />}
      />

      <Card>
        <CardContent>
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
              <FileDown className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-text-main">
                Export data pendaftar aktif
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
                Unduh seluruh data pendaftar dalam format Excel. Untuk export
                berdasarkan pencarian atau filter status, gunakan tombol Export
                Excel pada halaman Data Pendaftar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
