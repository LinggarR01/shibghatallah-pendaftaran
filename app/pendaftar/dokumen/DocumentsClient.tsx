'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { AlertCircle, Download, FileUp, Trash2, Upload } from 'lucide-react';

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
      <section className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Memuat dokumen...
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
          Dokumen Pendaftaran
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">
          Upload Dokumen
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Format yang diperbolehkan PDF, JPG, JPEG, dan PNG. Maksimal 5 MB per
          file. Dokumen hanya bisa diubah saat status DRAFT atau PERLU REVISI.
        </p>

        {!data?.canEdit && (
          <div className="mt-4 flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            Dokumen tidak bisa diubah pada status saat ini.
          </div>
        )}
        {message && (
          <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
      </section>

      <section className="grid gap-4">
        {data?.definitions.map((definition: DocumentDefinition) => {
          const document = documentsByType.get(definition.type);
          const isBusy =
            busyType === definition.type || busyType === document?.id?.toString();

          return (
            <div
              key={definition.type}
              className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FileUp className="h-5 w-5 text-emerald-700" />
                    <h2 className="font-bold text-slate-950">
                      {definition.label}
                    </h2>
                    {definition.required && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                        Wajib
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {document ? 'Sudah upload' : 'Belum upload'}
                  </p>
                  {document && (
                    <div className="mt-2 text-sm text-slate-500">
                      <p>{document.namaFile}</p>
                      <p>
                        {formatFileSize(document.ukuranFile)} ·{' '}
                        {new Date(document.diunggahPada).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {document && (
                    <a
                      href={`${document.url}?download=1`}
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
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
                        className="max-w-xs text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpload(definition.type)}
                        disabled={isBusy}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
                        <Upload className="h-4 w-4" />
                        {document ? 'Ganti' : 'Upload'}
                      </button>
                      {document && (
                        <button
                          type="button"
                          onClick={() => handleDelete(document.id.toString())}
                          disabled={isBusy}
                          className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">
                          <Trash2 className="h-4 w-4" />
                          Hapus
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
