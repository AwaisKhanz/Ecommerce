import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const containerVariants = cva('mx-auto w-full px-4 sm:px-6 lg:px-8', {
  variants: {
    size: {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-[1200px]',
      '2xl': 'max-w-[1400px]',
    },
  },
  defaultVariants: {
    size: 'xl',
  },
});

type ContainerProps = React.ComponentProps<'div'> & VariantProps<typeof containerVariants>;

function Container({ className, size, ...props }: ContainerProps): React.JSX.Element {
  return (
    <div data-slot="container" className={cn(containerVariants({ size }), className)} {...props} />
  );
}

export { Container, containerVariants };
