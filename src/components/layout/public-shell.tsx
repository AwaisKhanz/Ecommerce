import { PublicFooter } from '@/components/layout/public-footer';
import { PublicHeader } from '@/components/layout/public-header';

type PublicShellProps = {
  children: React.ReactNode;
};

function PublicShell({ children }: PublicShellProps): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

export { PublicShell };
