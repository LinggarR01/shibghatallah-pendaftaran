import { AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/cn';

export type StepperItem = {
  id: string;
  label: string;
  state: 'active' | 'complete' | 'pending' | 'error';
};

const stateStyles: Record<StepperItem['state'], string> = {
  active: 'border-primary bg-secondary text-primary',
  complete: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  pending: 'border-border-soft bg-white text-text-muted',
  error: 'border-red-200 bg-red-50 text-red-700',
};

export function Stepper({
  items,
  className,
}: {
  items: StepperItem[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Langkah formulir"
      className={cn('grid gap-2 sm:grid-cols-2 xl:grid-cols-6', className)}>
      {items.map((item, index) => {
        const Icon =
          item.state === 'complete'
            ? CheckCircle2
            : item.state === 'error'
              ? AlertCircle
              : Circle;

        return (
          <div
            key={item.id}
            aria-current={item.state === 'active' ? 'step' : undefined}
            className={cn(
              'flex min-w-0 items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold',
              stateStyles[item.state],
            )}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/80 text-xs">
              {item.state === 'pending' || item.state === 'active' ? (
                index + 1
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </span>
            <span className="min-w-0 truncate">{item.label}</span>
          </div>
        );
      })}
    </nav>
  );
}
