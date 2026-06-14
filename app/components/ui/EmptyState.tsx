import type { ReactNode } from 'react';
import { ClipboardList } from 'lucide-react';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-primary">
        <ClipboardList className="h-6 w-6" />
      </span>
      <p className="mt-4 text-sm font-bold text-text-main">{title}</p>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-text-muted">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
