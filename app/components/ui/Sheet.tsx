'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Tutup menu"
        className="absolute inset-0 bg-text-main/35 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  );
}

type SheetContentProps = HTMLAttributes<HTMLDivElement> & {
  onClose?: () => void;
};

export function SheetContent({ className, onClose, children, ...props }: SheetContentProps) {
  return (
    <div
      className={cn(
        'absolute inset-y-0 left-0 w-[min(88vw,340px)] overflow-y-auto border-r border-border-soft bg-white shadow-2xl shadow-emerald-950/20',
        className,
      )}
      {...props}>
      <div className="flex justify-end p-4">
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-soft text-text-muted hover:bg-surface hover:text-primary">
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
    </div>
  );
}
