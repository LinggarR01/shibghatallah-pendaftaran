import type { HTMLAttributes } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/cn';

type AlertVariant = 'default' | 'success' | 'warning' | 'destructive';

const variants: Record<AlertVariant, string> = {
  default: 'border-border-soft bg-surface text-text-main',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  destructive: 'border-red-200 bg-red-50 text-red-700',
};

const icons = {
  default: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  destructive: AlertCircle,
};

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
};

export function Alert({ className, variant = 'default', children, ...props }: AlertProps) {
  const Icon = icons[variant];

  return (
    <div
      className={cn(
        'flex gap-3 rounded-2xl border p-4 text-sm leading-6',
        variants[variant],
        className,
      )}
      {...props}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
