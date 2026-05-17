import { ChevronLeft, ChevronRight } from 'lucide-react';

import { AppLink } from '@/components/ui/app-link';
import { cn } from '@/lib/utils';

type ShopPaginationProps = {
  currentPage: number;
  pageCount: number;
  searchParams: Record<string, string | undefined>;
};

function pageHref(page: number, searchParams: Record<string, string | undefined>): string {
  const params = new URLSearchParams(
    Object.entries(searchParams).filter((entry): entry is [string, string] => Boolean(entry[1])),
  );

  if (page <= 1) {
    params.delete('page');
  } else {
    params.set('page', String(page));
  }

  const query = params.toString();
  return query ? `/shop?${query}` : '/shop';
}

function ShopPagination({
  currentPage,
  pageCount,
  searchParams,
}: ShopPaginationProps): React.JSX.Element | null {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).slice(0, 4);

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <PaginationLink
        href={pageHref(Math.max(1, currentPage - 1), searchParams)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft aria-hidden className="size-4" />
      </PaginationLink>
      {pages.map((page) => (
        <PaginationLink
          key={page}
          href={pageHref(page, searchParams)}
          active={page === currentPage}
        >
          {page}
        </PaginationLink>
      ))}
      {pageCount > 5 ? <span className="px-1 text-fg-muted">…</span> : null}
      {pageCount > 4 ? (
        <PaginationLink href={pageHref(pageCount, searchParams)} active={pageCount === currentPage}>
          {pageCount}
        </PaginationLink>
      ) : null}
      <PaginationLink
        href={pageHref(Math.min(pageCount, currentPage + 1), searchParams)}
        disabled={currentPage >= pageCount}
      >
        <ChevronRight aria-hidden className="size-4" />
      </PaginationLink>
    </nav>
  );
}

type PaginationLinkProps = {
  active?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  href: string;
};

function PaginationLink({
  active = false,
  children,
  disabled = false,
  href,
}: PaginationLinkProps): React.JSX.Element {
  return (
    <AppLink
      href={href}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-md border border-border bg-surface text-sm hover:text-fg',
        active && 'border-accent bg-accent text-accent-fg hover:text-accent-fg',
        disabled && 'pointer-events-none text-fg-muted opacity-60',
      )}
    >
      {children}
    </AppLink>
  );
}

export { ShopPagination };
