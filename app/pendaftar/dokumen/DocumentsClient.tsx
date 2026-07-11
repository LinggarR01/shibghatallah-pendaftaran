'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Alert } from '@/app/components/ui/Alert';
import { Card, CardContent } from '@/app/components/ui/Card';
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog';
import { DocumentUploadCard } from '@/app/components/ui/DocumentUploadCard';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { toast } from '@/app/components/ui/Toast';

const maxFileSize = 5 * 1024 * 1024;
const allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/png'];

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

  function showError(message: string) {
    setError(message);
    toast.error(message);
  }

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
        showError(payload.message || 'Gagal mengambil dokumen');
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
          showError(payload.message || 'Gagal mengambil dokumen');
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
    const file = event.target.files?.[0] ?? null;

    if (file && !allowedFileTypes.includes(file.type)) {
      showError('File harus PDF, JPG, JPEG, atau PNG.');
      event.target.value = '';
      return;
    }

    if (file && file.size > maxFileSize) {
      showError('Ukuran file maksimal 5 MB.');
      event.target.value = '';
      return;
    }

    setSelectedFiles((current) => ({
      ...current,
      [type]: file,
    }));
  }

  async function handleUpload(type: string) {
    const file = selectedFiles[type];
    if (!file) {
      showError('Pilih file terlebih dahulu.');
      return;
    }

    if (!allowedFileTypes.includes(file.type)) {
      showError('File harus PDF, JPG, JPEG, atau PNG.');
      return;
    }

    if (file.size > maxFileSize) {
      showError('Ukuran file maksimal 5 MB.');
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
        showError(payload.message || 'Gagal mengunggah dokumen.');
        return;
      }

      setSelectedFiles((current) => ({ ...current, [type]: null }));
      setMessage('Dokumen berhasil diunggah.');
      toast.success('Dokumen berhasil diunggah.');
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
        showError(payload.message || 'Hapus dokumen gagal.');
        return;
      }

      setMessage('Dokumen berhasil dihapus.');
      toast.success('Dokumen berhasil dihapus.');
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
          const selectedFile = selectedFiles[definition.type];

          return (
            <DocumentUploadCard
              key={definition.type}
              title={definition.label}
              required={definition.required}
              selectedFile={selectedFile}
              existingFileName={document?.namaFile}
              existingFileSize={formatFileSize(document?.ukuranFile ?? null)}
              uploadedAt={
                document
                  ? new Date(document.diunggahPada).toLocaleDateString('id-ID')
                  : undefined
              }
              statusLabel={
                document
                  ? document.statusVerifikasi.replaceAll('_', ' ')
                  : 'Belum diunggah'
              }
              canEdit={Boolean(data.canEdit)}
              busy={isBusy}
              viewHref={document?.url}
              downloadHref={document ? `${document.url}?download=1` : undefined}
              onFileChange={(event) => handleFileChange(definition.type, event)}
              onUpload={() => handleUpload(definition.type)}
              onRemove={
                document
                  ? () => setDeleteTarget(document.id.toString())
                  : selectedFile
                    ? () =>
                        setSelectedFiles((current) => ({
                          ...current,
                          [definition.type]: null,
                        }))
                    : undefined
              }
            />
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
