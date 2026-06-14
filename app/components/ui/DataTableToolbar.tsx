import type { ReactNode } from 'react';
import { Card, CardContent } from './Card';

type DataTableToolbarProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

export function DataTableToolbar({
  title = 'Filter data',
  description = 'Gunakan pencarian dan status untuk menemukan data lebih cepat.',
  children,
}: DataTableToolbarProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-base font-bold text-text-main">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-text-muted">{description}</p>
          </div>
          <div className="w-full xl:max-w-3xl">{children}</div>
        </div>
      </CardContent>
    </Card>
  );
}
