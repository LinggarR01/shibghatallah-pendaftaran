import type { ReactNode } from 'react';
import { Card, CardContent } from './Card';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent-gold to-secondary" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            {eyebrow && (
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-main sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-text-muted">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex flex-col gap-3 sm:flex-row">{actions}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
