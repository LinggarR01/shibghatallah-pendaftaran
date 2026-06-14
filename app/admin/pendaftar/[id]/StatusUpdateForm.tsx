'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Alert } from '@/app/components/ui/Alert';
import { Button } from '@/app/components/ui/Button';
import { Label } from '@/app/components/ui/Label';
import { Select } from '@/app/components/ui/Select';
import { Textarea } from '@/app/components/ui/Textarea';

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
        <Alert variant="success">
          {message}
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}
      <Label className="block">
        <span className="mb-2 block">
          Status
        </span>
        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value)}>
          <option value="draft">DRAFT</option>
          <option value="menunggu_verifikasi">MENUNGGU VERIFIKASI</option>
          <option value="perlu_revisi">PERLU REVISI</option>
          <option value="diterima">DITERIMA</option>
          <option value="ditolak">DITOLAK</option>
        </Select>
      </Label>
      <Label className="block">
        <span className="mb-2 block">
          Catatan admin
        </span>
        <Textarea
          value={catatanAdmin}
          onChange={(event) => setCatatanAdmin(event.target.value)}
          rows={5}
          placeholder="Wajib diisi jika status PERLU REVISI"
        />
      </Label>
      <Button
        type="submit"
        disabled={loading}>
        {loading ? 'Menyimpan...' : 'Simpan Status'}
      </Button>
    </form>
  );
}
