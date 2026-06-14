import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'gold';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-primary text-white',
  secondary: 'bg-secondary text-primary',
  outline: 'border border-border-soft bg-white text-text-muted',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  gold: 'bg-amber-50 text-[#8a6507] ring-1 ring-[#d4a017]/30',
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
