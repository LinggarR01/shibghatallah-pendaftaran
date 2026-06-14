import type { InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';
import { Input } from './Input';
import { cn } from '@/lib/cn';

export function SearchInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      <Input className={cn('pl-10', className)} {...props} />
    </div>
  );
}
