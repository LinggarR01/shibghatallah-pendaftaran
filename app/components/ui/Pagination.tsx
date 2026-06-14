import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  page: number;
  pageCount: number;
  total: number;
  previousHref: string;
  nextHref: string;
};

export function Pagination({
  page,
  pageCount,
  total,
  previousHref,
  nextHref,
}: PaginationProps) {
  const isFirst = page <= 1;
  const isLast = page >= pageCount;

  return (
    <div className="flex flex-col gap-3 border-t border-border-soft px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span className="text-text-muted">
        Halaman {page} dari {pageCount} &middot; Total {total}
      </span>
      <div className="flex gap-2">
        <Link
          href={previousHref}
          aria-disabled={isFirst}
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border-soft px-3 font-semibold transition ${
            isFirst
              ? 'pointer-events-none bg-surface text-text-muted/60'
              : 'bg-white text-primary hover:bg-surface'
          }`}>
          <ChevronLeft className="h-4 w-4" />
          Sebelumnya
        </Link>
        <Link
          href={nextHref}
          aria-disabled={isLast}
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border-soft px-3 font-semibold transition ${
            isLast
              ? 'pointer-events-none bg-surface text-text-muted/60'
              : 'bg-white text-primary hover:bg-surface'
          }`}>
          Berikutnya
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
