import { BrandMark } from '@/components/icons';
import { AppLink } from '@/components/ui/app-link';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
  href?: string;
};

function BrandLogo({ className, compact = false, href = '/' }: BrandLogoProps): React.JSX.Element {
  return (
    <AppLink
      href={href}
      className={cn('inline-flex items-center gap-3 text-fg hover:text-fg', className)}
      event="nav.logo"
    >
      <BrandMark className="size-8 text-accent" />
      {compact ? null : (
        <span className="font-display text-lg font-semibold">{siteConfig.name}</span>
      )}
    </AppLink>
  );
}

export { BrandLogo };
