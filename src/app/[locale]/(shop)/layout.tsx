import { PublicShell } from '@/components/layout/public-shell';

type ShopLayoutProps = {
  children: React.ReactNode;
};

export default function ShopLayout({ children }: ShopLayoutProps): React.JSX.Element {
  return <PublicShell>{children}</PublicShell>;
}
