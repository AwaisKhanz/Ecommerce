import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    },
    gap: {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
  },
  defaultVariants: {
    cols: 1,
    gap: 'md',
  },
});

type GridProps = React.ComponentProps<'div'> & VariantProps<typeof gridVariants>;

function Grid({ className, cols, gap, ...props }: GridProps): React.JSX.Element {
  return <div data-slot="grid" className={cn(gridVariants({ cols, gap }), className)} {...props} />;
}

export { Grid, gridVariants };
