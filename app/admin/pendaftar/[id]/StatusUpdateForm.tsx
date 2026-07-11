'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Alert } from '@/app/components/ui/Alert';
import { Button } from '@/app/components/ui/Button';
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog';
import { Label } from '@/app/components/ui/Label';
import { Select } from '@/app/components/ui/Select';
import { Textarea } from '@/app/components/ui/Textarea';
import { toast } from '@/app/components/ui/Toast';
import { getRegistrationStatusLabel, type StatusPendaftaran } from '@/lib/registration';

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (status === 'perlu_revisi' && !catatanAdmin.trim()) {
      const message = 'Catatan admin wajib diisi untuk status Perlu Revisi.';
      setError(message);
      toast.warning(message);
      return;
    }

    setConfirmOpen(true);
  }

  async function updateStatus() {
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
        const message = payload.message || 'Terjadi kesalahan. Silakan coba lagi.';
        setError(message);
        toast.error(message);
        return;
      }

      const message = 'Status pendaftaran berhasil diperbarui.';
      setMessage(message);
      toast.success(message);
      router.refresh();
    } catch {
      const message = 'Terjadi kesalahan. Silakan coba lagi.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
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
    <ConfirmDialog
      open={confirmOpen}
      title={`Ubah status menjadi ${getRegistrationStatusLabel(status as StatusPendaftaran)}?`}
      description={
        status === 'perlu_revisi'
          ? 'Pendaftar akan dapat memperbaiki data dan dokumen berdasarkan catatan admin.'
          : 'Status pendaftaran akan diperbarui dan terlihat oleh pendaftar.'
      }
      confirmLabel="Simpan Status"
      loading={loading}
      onOpenChange={setConfirmOpen}
      onConfirm={() => void updateStatus()}
    />
    </>
  );
}
