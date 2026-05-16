import { Shield } from 'lucide-react';

import { BrandLogo } from '@/components/layout/brand-logo';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

type AuthShellProps = {
  children: React.ReactNode;
};

type AuthCardProps = React.ComponentProps<'section'>;

function AuthShell({ children }: AuthShellProps): React.JSX.Element {
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto] bg-page">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10 lg:px-12">
        <BrandLogo />
        <span className="inline-flex items-center gap-2 text-sm text-fg-muted">
          <Shield aria-hidden className="size-4" />
          Secure admin sign-in
        </span>
      </header>

      <main className="flex items-center justify-center px-4 py-8">{children}</main>

      <footer className="flex flex-col gap-3 px-6 py-6 text-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-12">
        <span>© 2026 {siteConfig.name}. Admin Panel v1.0</span>
        <span>
          Need help? <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>
        </span>
      </footer>
    </div>
  );
}

function AuthCard({ className, ...props }: AuthCardProps): React.JSX.Element {
  return (
    <section
      className={cn(
        'w-full max-w-xl overflow-hidden rounded-lg border border-border bg-surface',
        className,
      )}
      {...props}
    />
  );
}

export { AuthCard, AuthShell };
