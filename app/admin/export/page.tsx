import { FileDown } from 'lucide-react';

export default function AdminExportPage() {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <FileDown className="mt-1 h-6 w-6 text-emerald-700" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
            Export Data
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            Export penuh belum diaktifkan
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Navigasi admin sudah tersedia. Implementasi export CSV/Excel penuh
            akan masuk pada fase export sesuai PRD.
          </p>
        </div>
      </div>
    </section>
  );
}
