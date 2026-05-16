import { ChevronDown, Clock3, Headphones, Menu, Search, ShoppingCart } from 'lucide-react';

import { BrandLogo } from '@/components/layout/brand-logo';
import { AppLink } from '@/components/ui/app-link';
import { publicNav } from '@/config/nav';
import { siteConfig } from '@/config/site';

function PublicHeader(): React.JSX.Element {
  return (
    <header className="border-b border-border bg-surface">
      <div className="border-b border-border bg-page">
        <div className="mx-auto flex h-7 max-w-[1400px] items-center justify-between px-4 text-[11px] text-fg-muted sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <ShoppingCart aria-hidden className="size-3" />
              Cash on Delivery nationwide
            </span>
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <Clock3 aria-hidden className="size-3" />
              {siteConfig.hours}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <Headphones aria-hidden className="size-3" />
              {siteConfig.phone}
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-1"
              aria-label="Change language"
            >
              EN
              <ChevronDown aria-hidden className="size-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <BrandLogo />
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-6 text-sm md:flex"
          >
            {publicNav.map((item) => (
              <AppLink
                key={item.href}
                href={item.href}
                event={`nav.${item.label.toLowerCase()}`}
                className="text-fg-muted hover:text-fg"
              >
                {item.label}
              </AppLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative hidden md:block">
            <span className="sr-only">Search</span>
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
            />
            <input
              type="search"
              placeholder="Search generators, pumps, tools..."
              className="h-9 w-72 rounded-md border border-border bg-page pl-9 pr-3 text-sm text-fg outline-none placeholder:text-fg-muted focus:border-accent"
            />
          </label>
          <button
            type="button"
            className="relative inline-flex items-center gap-1.5 text-sm"
            aria-label="Open cart"
          >
            <ShoppingCart aria-hidden className="size-4" />
            <span className="hidden sm:inline">Cart</span>
            <span className="absolute -right-2 -top-2 inline-flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-fg">
              2
            </span>
          </button>
          <button type="button" className="inline-flex md:hidden" aria-label="Open menu">
            <Menu aria-hidden className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export { PublicHeader };
