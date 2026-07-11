'use client';

import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

type ToastType = 'success' | 'error' | 'warning' | 'info';

type ToastPayload = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastInput = {
  type: ToastType;
  message: string;
};

const toastEventName = 'app-toast';
const defaultDuration = 4500;

function emitToast(input: ToastInput) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<ToastInput>(toastEventName, {
      detail: input,
    }),
  );
}

export const toast = {
  success(message: string) {
    emitToast({ type: 'success', message });
  },
  error(message: string) {
    emitToast({ type: 'error', message });
  },
  warning(message: string) {
    emitToast({ type: 'warning', message });
  },
  info(message: string) {
    emitToast({ type: 'info', message });
  },
};

const styles: Record<ToastType, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'border-sky-200 bg-sky-50 text-sky-900',
};

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info,
};

export function Toaster() {
  const [items, setItems] = useState<ToastPayload[]>([]);

  useEffect(() => {
    function handleToast(event: Event) {
      const detail = (event as CustomEvent<ToastInput>).detail;

      if (!detail?.message) return;

      const id = Date.now() + Math.random();
      setItems((current) => [
        ...current,
        {
          id,
          type: detail.type,
          message: detail.message,
        },
      ]);

      window.setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== id));
      }, defaultDuration);
    }

    window.addEventListener(toastEventName, handleToast);
    return () => window.removeEventListener(toastEventName, handleToast);
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
      {items.map((item) => {
        const Icon = icons[item.type];

        return (
          <div
            key={item.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg shadow-slate-900/10',
              styles[item.type],
            )}>
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="min-w-0 flex-1 leading-5">{item.message}</p>
            <button
              type="button"
              onClick={() =>
                setItems((current) =>
                  current.filter((toastItem) => toastItem.id !== item.id),
                )
              }
              className="rounded-md p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100"
              aria-label="Tutup notifikasi">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
