'use client';

import * as React from 'react';

import { Link } from '@/lib/i18n/navigation';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';

type AppLinkProps = React.ComponentProps<typeof Link> & {
  event?: string;
};

function AppLink({ className, event, href, onClick, ...props }: AppLinkProps): React.JSX.Element {
  return (
    <Link
      className={cn('transition-colors hover:text-accent', className)}
      href={href}
      onClick={(clickEvent) => {
        if (event) track('nav.click', { event, href: String(href) });
        onClick?.(clickEvent);
      }}
      {...props}
    />
  );
}

export { AppLink };
