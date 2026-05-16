import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminTopbar } from '@/components/layout/admin-topbar';

type AdminShellProps = {
  children: React.ReactNode;
};

function AdminShell({ children }: AdminShellProps): React.JSX.Element {
  return (
    <div className="min-h-screen bg-page lg:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminTopbar />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export { AdminShell };
