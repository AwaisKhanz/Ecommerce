import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex h-[22px] w-fit shrink-0 items-center gap-1.5 rounded-full px-2 text-[11.5px] font-medium',
  {
    variants: {
      variant: {
        neutral: 'bg-muted text-zinc-600',
        success: 'bg-success/10 text-green-700',
        info: 'bg-info/10 text-blue-700',
        warning: 'bg-warn/10 text-amber-700',
        danger: 'bg-danger/10 text-red-700',
        outline: 'border border-border bg-surface text-fg',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
);

type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
  };

function Badge({ className, variant, asChild = false, ...props }: BadgeProps): React.JSX.Element {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
export type { BadgeProps };
