import type * as React from 'react';

import { cn } from '@/lib/utils';

type BrandMarkProps = React.SVGProps<SVGSVGElement>;

function BrandMark({ className, ...props }: BrandMarkProps): React.JSX.Element {
  return (
    <svg aria-hidden viewBox="0 0 32 32" fill="none" className={cn('size-8', className)} {...props}>
      <rect x="1" y="1" width="30" height="30" rx="7" fill="currentColor" />
      <path d="M17.8 7.5 11.5 17.3h4.1l-1.4 7.2 6.3-9.8h-4.1l1.4-7.2Z" fill="white" />
    </svg>
  );
}

export { BrandMark };
