'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Download, FileUp, Trash2, Upload } from 'lucide-react';
import { Alert } from '@/app/components/ui/Alert';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Card, CardContent } from '@/app/components/ui/Card';
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Skeleton } from '@/app/components/ui/Skeleton';

type DocumentDefinition = {
  type: string;
  label: string;
  required: boolean;
};

type UploadedDocument = {
  id: string;
  jenisDokumen: string;
  namaFile: string;
  tipeFile: string | null;
  ukuranFile: string | number | null;
  statusVerifikasi: string;
  catatanAdmin: string | null;
  diunggahPada: string;
  url: string;
};

type DocumentsPayload = {
  canEdit: boolean;
  status: string | null;
  definitions: DocumentDefinition[];
  documents: UploadedDocument[];
};

function formatFileSize(value: string | number | null) {
  if (!value) return '-';
  const bytes = Number(value);
  if (!Number.isFinite(bytes)) return '-';
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function DocumentsClient() {
  const [data, setData] = useState<DocumentsPayload | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [loading, setLoading] = useState(true);
  const [busyType, setBusyType] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const documentsByType = useMemo(() => {
    const map = new Map<string, UploadedDocument>();
    data?.documents.forEach((document: UploadedDocument) => {
      map.set(document.jenisDokumen, document);
    });
    return map;
  }, [data]);

  async function loadDocuments() {
    setLoading(true);
    try {
      const response = await fetch('/api/pendaftar/documents', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.message || 'Gagal mengambil dokumen');
        return;
      }
      setData(payload.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function loadInitialDocuments() {
      try {
        const response = await fetch('/api/pendaftar/documents', {
          credentials: 'include',
        });
        const payload = await response.json();

        if (ignore) return;

        if (!response.ok) {
          setError(payload.message || 'Gagal mengambil dokumen');
          return;
        }
        setData(payload.data);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadInitialDocuments();

    return () => {
      ignore = true;
    };
  }, []);

  function handleFileChange(
    type: string,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setSelectedFiles((current) => ({
      ...current,
      [type]: event.target.files?.[0] ?? null,
    }));
  }

  async function handleUpload(type: string) {
    const file = selectedFiles[type];
    if (!file) {
      setError('Pilih file terlebih dahulu');
      return;
    }

    setBusyType(type);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('documentType', type);
    formData.append('file', file);

    try {
      const response = await fetch('/api/pendaftar/documents', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.message || 'Upload dokumen gagal');
        return;
      }

      setSelectedFiles((current) => ({ ...current, [type]: null }));
      setMessage('Dokumen berhasil diunggah');
      await loadDocuments();
    } finally {
      setBusyType(null);
    }
  }

  async function handleDelete(documentId: string) {
    setBusyType(documentId);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/pendaftar/documents/${documentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.message || 'Hapus dokumen gagal');
        return;
      }

      setMessage('Dokumen berhasil dihapus');
      await loadDocuments();
    } finally {
      setBusyType(null);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-4 h-8 w-80 max-w-full" />
          <div className="mt-6 grid gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dokumen Pendaftaran"
        title="Upload Dokumen"
        description="Format yang diperbolehkan PDF, JPG, JPEG, dan PNG. Maksimal 5 MB per file. Dokumen hanya bisa diubah saat status DRAFT atau PERLU REVISI."
      />

      {!data?.canEdit && (
        <Alert variant="warning">
          Dokumen tidak bisa diubah pada status saat ini.
        </Alert>
      )}
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="destructive">{error}</Alert>}

      <section className="grid gap-4">
        {data?.definitions.map((definition: DocumentDefinition) => {
          const document = documentsByType.get(definition.type);
          const isBusy =
            busyType === definition.type || busyType === document?.id?.toString();

          return (
            <Card key={definition.type}>
              <CardContent>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                        <FileUp className="h-5 w-5" />
                      </span>
                      <h2 className="font-bold text-text-main">
                        {definition.label}
                      </h2>
                      {definition.required && <Badge variant="danger">Wajib</Badge>}
                    </div>
                    <p className="mt-2 text-sm text-text-muted">
                      {document ? 'Sudah upload' : 'Belum upload'}
                    </p>
                    {document && (
                      <div className="mt-2 text-sm text-text-muted">
                        <p>{document.namaFile}</p>
                        <p>
                          {formatFileSize(document.ukuranFile)} &middot;{' '}
                          {new Date(document.diunggahPada).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {document && (
                      <a
                        href={`${document.url}?download=1`}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border-soft bg-white px-3 text-sm font-semibold text-primary hover:bg-surface">
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    )}

                    {data.canEdit && (
                      <>
                        <input
                          type="file"
                          accept="application/pdf,image/jpeg,image/png"
                          onChange={(event) =>
                            handleFileChange(definition.type, event)
                          }
                          className="max-w-xs text-sm text-text-muted file:mr-3 file:rounded-xl file:border-0 file:bg-surface file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary"
                        />
                        <Button
                          type="button"
                          onClick={() => handleUpload(definition.type)}
                          disabled={isBusy}>
                          <Upload className="h-4 w-4" />
                          {document ? 'Ganti' : 'Upload'}
                        </Button>
                        {document && (
                          <Button
                            type="button"
                            onClick={() => setDeleteTarget(document.id.toString())}
                            disabled={isBusy}
                            variant="destructive">
                            <Trash2 className="h-4 w-4" />
                            Hapus
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus dokumen?"
        description="Dokumen yang dihapus perlu diunggah ulang jika masih dibutuhkan untuk verifikasi."
        confirmLabel="Hapus dokumen"
        loading={Boolean(deleteTarget && busyType === deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) {
            void handleDelete(deleteTarget).then(() => setDeleteTarget(null));
          }
        }}
      />
    </div>
  );
}
