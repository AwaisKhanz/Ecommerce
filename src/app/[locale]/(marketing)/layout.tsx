import { PublicShell } from '@/components/layout/public-shell';

type MarketingLayoutProps = {
  children: React.ReactNode;
};

export default function MarketingLayout({ children }: MarketingLayoutProps): React.JSX.Element {
  return <PublicShell>{children}</PublicShell>;
}
