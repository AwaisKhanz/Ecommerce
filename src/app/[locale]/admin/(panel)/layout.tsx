import { AdminShell } from '@/components/layout/admin-shell';

type AdminPanelLayoutProps = {
  children: React.ReactNode;
};

export default function AdminPanelLayout({ children }: AdminPanelLayoutProps): React.JSX.Element {
  return <AdminShell>{children}</AdminShell>;
}
