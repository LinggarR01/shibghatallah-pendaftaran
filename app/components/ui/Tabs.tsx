import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function Tabs({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-4', className)} {...props} />;
}

export function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('inline-flex rounded-2xl border border-border-soft bg-surface p-1', className)}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'rounded-xl px-3 py-2 text-sm font-semibold text-text-muted transition hover:bg-white hover:text-primary',
        className,
      )}
      {...props}
    />
  );
}
