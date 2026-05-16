import { Bell, Search, UserRound } from 'lucide-react';

import { ThemeToggle } from '@/components/theme/theme-toggle';

function AdminTopbar(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      <div>
        <p className="text-xs text-fg-muted">Admin</p>
        <p className="font-display text-sm font-semibold">Dashboard</p>
      </div>

      <div className="flex items-center gap-3">
        <label className="relative hidden sm:block">
          <span className="sr-only">Search</span>
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
          />
          <input
            type="search"
            placeholder="Search products, orders, customers..."
            className="h-9 w-72 rounded-md border border-border bg-page pl-9 pr-3 text-sm outline-none placeholder:text-fg-muted focus:border-accent"
          />
        </label>
        <ThemeToggle />
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-md border border-border p-2 text-fg-muted hover:bg-muted hover:text-fg"
        >
          <Bell aria-hidden className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Open profile menu"
          className="inline-flex items-center gap-2 rounded-full border border-border px-2 py-1.5 text-sm"
        >
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-accent text-accent-fg">
            <UserRound aria-hidden className="size-4" />
          </span>
          <span className="hidden sm:inline">Awais</span>
        </button>
      </div>
    </header>
  );
}

export { AdminTopbar };
