import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-xl border border-border-soft bg-white px-3 text-sm text-text-main outline-none transition placeholder:text-text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface disabled:text-text-muted',
        className,
      )}
      {...props}
    />
  );
}
