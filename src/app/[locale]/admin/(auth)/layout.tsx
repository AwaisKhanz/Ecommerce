import { AuthShell } from '@/components/layout/auth-shell';

type AdminAuthLayoutProps = {
  children: React.ReactNode;
};

export default function AdminAuthLayout({ children }: AdminAuthLayoutProps): React.JSX.Element {
  return <AuthShell>{children}</AuthShell>;
}
