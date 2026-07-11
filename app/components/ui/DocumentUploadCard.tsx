'use client';

import { Download, Eye, FileCheck2, FileUp, RefreshCw, Trash2 } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { Badge } from './Badge';
import { Button } from './Button';
import { cn } from '@/lib/cn';

type DocumentUploadCardProps = {
  title: string;
  description?: string;
  required?: boolean;
  selectedFile?: File | null;
  existingFileName?: string | null;
  existingFileSize?: string;
  uploadedAt?: string;
  statusLabel?: string;
  canEdit?: boolean;
  busy?: boolean;
  viewHref?: string;
  downloadHref?: string;
  accept?: string;
  onFileChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onUpload?: () => void;
  onRemove?: () => void;
};

export function DocumentUploadCard({
  title,
  description = 'PDF, JPG, JPEG, atau PNG. Maksimal 5 MB.',
  required = false,
  selectedFile,
  existingFileName,
  existingFileSize,
  uploadedAt,
  statusLabel,
  canEdit = true,
  busy = false,
  viewHref,
  downloadHref,
  accept = 'application/pdf,image/jpeg,image/png',
  onFileChange,
  onUpload,
  onRemove,
}: DocumentUploadCardProps) {
  const hasFile = Boolean(selectedFile || existingFileName);

  return (
    <div className="rounded-xl border border-border-soft bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              {hasFile ? <FileCheck2 className="h-5 w-5" /> : <FileUp className="h-5 w-5" />}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-text-main">{title}</h3>
                {required && <Badge variant="danger">Wajib</Badge>}
                {statusLabel && <Badge variant="outline">{statusLabel}</Badge>}
              </div>
              <p className="mt-1 text-sm leading-5 text-text-muted">{description}</p>
              {selectedFile && (
                <p className="mt-2 truncate text-sm font-medium text-primary">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              {!selectedFile && existingFileName && (
                <div className="mt-2 text-sm text-text-muted">
                  <p className="truncate font-medium text-text-main">{existingFileName}</p>
                  <p>
                    {existingFileSize ?? '-'}
                    {uploadedAt ? ` - ${uploadedAt}` : ''}
                  </p>
                </div>
              )}
              {!hasFile && (
                <p className="mt-2 text-sm font-medium text-amber-700">
                  Belum diunggah
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
          {viewHref && (
            <a
              href={viewHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border-soft bg-white px-3 text-sm font-semibold text-primary hover:bg-surface">
              <Eye className="h-4 w-4" />
              Lihat
            </a>
          )}
          {downloadHref && (
            <a
              href={downloadHref}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border-soft bg-white px-3 text-sm font-semibold text-primary hover:bg-surface">
              <Download className="h-4 w-4" />
              Unduh
            </a>
          )}
          {canEdit && (
            <>
              <label
                className={cn(
                  'inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-soft bg-white px-3 text-sm font-semibold text-primary hover:bg-surface',
                  busy && 'pointer-events-none opacity-60',
                )}>
                <RefreshCw className="h-4 w-4" />
                {hasFile ? 'Ganti' : 'Pilih File'}
                <input
                  type="file"
                  accept={accept}
                  className="sr-only"
                  disabled={busy}
                  onChange={onFileChange}
                />
              </label>
              {onUpload && (
                <Button type="button" onClick={onUpload} disabled={busy || !selectedFile}>
                  <FileUp className="h-4 w-4" />
                  {busy ? 'Mengunggah...' : 'Upload'}
                </Button>
              )}
              {onRemove && hasFile && (
                <Button type="button" variant="destructive" onClick={onRemove} disabled={busy}>
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
