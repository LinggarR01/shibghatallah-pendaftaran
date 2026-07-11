'use client';

import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { Alert } from '@/app/components/ui/Alert';
import { Button } from '@/app/components/ui/Button';
import { toast } from '@/app/components/ui/Toast';

type ExportButtonProps = {
  href: string;
};

function getFileName(response: Response) {
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const match = disposition.match(/filename="([^"]+)"/);

  return match?.[1] ?? 'data-pendaftar-shibghatallah.xlsx';
}

export function ExportButton({ href }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleExport() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(href, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.message ?? 'Export Excel gagal diproses.';
        setError(message);
        toast.error(message);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = getFileName(response);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success('Export Excel berhasil diproses.');
    } catch {
      const message = 'Export Excel gagal diproses. Silakan coba lagi.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="secondary"
        onClick={handleExport}
        disabled={loading}
        className="w-full sm:w-auto">
        <FileDown className="h-4 w-4" />
        {loading ? 'Menyiapkan...' : 'Export Excel'}
      </Button>
      {error && (
        <Alert variant="destructive" className="max-w-sm py-3">
          {error}
        </Alert>
      )}
    </div>
  );
}
