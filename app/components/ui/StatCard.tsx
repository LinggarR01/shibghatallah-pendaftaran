import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './Card';

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: 'green' | 'gold' | 'red' | 'muted';
  helper?: string;
};

const tones = {
  green: 'bg-secondary text-primary',
  gold: 'bg-amber-50 text-[#8a6507]',
  red: 'bg-red-50 text-red-700',
  muted: 'bg-surface text-text-muted',
};

export function StatCard({ label, value, icon: Icon, tone = 'green', helper }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-text-muted">{label}</p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-text-main">
              {value}
            </p>
            {helper && <p className="mt-2 text-xs text-text-muted">{helper}</p>}
          </div>
          {Icon && (
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}>
              <Icon className="h-5 w-5" />
            </span>
          )}
        </div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-surface">
          <div className="h-full w-2/3 rounded-full bg-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
