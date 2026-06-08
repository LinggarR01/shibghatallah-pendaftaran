'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

type ContinueRegistrationAlertProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ContinueRegistrationAlert({
  onCancel,
  onConfirm,
}: ContinueRegistrationAlertProps) {
  const router = useRouter();

  function handleConfirm() {
    onConfirm();
    router.push('/');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-5 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-4xl border border-white/70 bg-white p-6 shadow-2xl shadow-slate-950/20">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
            <AlertCircle className="h-6 w-6" />
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup alert">
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2 className="text-xl font-bold text-slate-950">Kirim Pendaftaran?</h2>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Pastikan seluruh data calon santri, data orang tua/wali, dan berkas
          yang diunggah sudah benar sebelum dikirim.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Periksa Kembali
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-800">
            <CheckCircle className="h-4 w-4" />
            Ya, Kirim
          </button>
        </div>
      </div>
    </div>
  );
}
