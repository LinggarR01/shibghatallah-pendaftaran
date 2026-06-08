'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

type StatusUpdateFormProps = {
  registrationId: string;
  currentStatus: string;
  currentNote?: string | null;
};

export default function StatusUpdateForm({
  registrationId,
  currentStatus,
  currentNote,
}: StatusUpdateFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [catatanAdmin, setCatatanAdmin] = useState(currentNote ?? '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(
        `/api/admin/pendaftaran/${registrationId}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status, catatanAdmin }),
        },
      );
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.message || 'Gagal memperbarui status');
        return;
      }

      setMessage('Status berhasil diperbarui');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          Status
        </span>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10">
          <option value="draft">DRAFT</option>
          <option value="menunggu_verifikasi">MENUNGGU VERIFIKASI</option>
          <option value="perlu_revisi">PERLU REVISI</option>
          <option value="diterima">DITERIMA</option>
          <option value="ditolak">DITOLAK</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          Catatan admin
        </span>
        <textarea
          value={catatanAdmin}
          onChange={(event) => setCatatanAdmin(event.target.value)}
          rows={5}
          className="w-full resize-none rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
          placeholder="Wajib diisi jika status PERLU REVISI"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? 'Menyimpan...' : 'Simpan Status'}
      </button>
    </form>
  );
}
