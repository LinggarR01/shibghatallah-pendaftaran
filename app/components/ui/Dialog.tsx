'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Tutup dialog"
        className="absolute inset-0 bg-text-main/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  );
}

type DialogContentProps = HTMLAttributes<HTMLDivElement> & {
  onClose?: () => void;
};

export function DialogContent({
  className,
  onClose,
  children,
  ...props
}: DialogContentProps) {
  return (
    <div
      className={cn(
        'relative w-full max-w-md rounded-2xl border border-border-soft bg-white p-5 shadow-2xl shadow-emerald-950/20',
        className,
      )}
      {...props}>
      {onClose && (
        <button
          type="button"
          aria-label="Tutup dialog"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl text-text-muted hover:bg-surface hover:text-primary">
          <X className="h-4 w-4" />
        </button>
      )}
      {children}
    </div>
  );
}
