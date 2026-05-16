import { LogOut } from 'lucide-react';

import { BrandLogo } from '@/components/layout/brand-logo';
import { AppLink } from '@/components/ui/app-link';
import { adminNav } from '@/config/nav';

function AdminSidebar(): React.JSX.Element {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-border bg-surface lg:flex lg:flex-col">
      <div className="border-b border-border px-5 py-4">
        <BrandLogo />
        <p className="mt-1 pl-11 text-[11px] uppercase tracking-[0.18em] text-fg-muted">
          Admin panel
        </p>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 px-3 py-4">
        <p className="px-3 pb-3 text-[11px] uppercase tracking-[0.16em] text-fg-muted">Workspace</p>
        <ul className="flex flex-col gap-1">
          {adminNav.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <AppLink
                  href={item.href}
                  event={`admin.${item.label.toLowerCase()}`}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-fg-muted hover:bg-muted hover:text-fg"
                >
                  <Icon aria-hidden className="size-4" />
                  {item.label}
                </AppLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium">Awais Saleem</p>
            <p className="text-xs text-fg-muted">super_admin</p>
          </div>
          <button type="button" aria-label="Sign out" className="text-fg-muted hover:text-fg">
            <LogOut aria-hidden className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export { AdminSidebar };
