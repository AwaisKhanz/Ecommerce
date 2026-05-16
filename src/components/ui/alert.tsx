import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const alertVariants = cva('relative grid w-full gap-1 rounded-lg border p-4 text-sm', {
  variants: {
    variant: {
      default: 'border-border bg-surface text-fg',
      success: 'border-success/30 bg-success/10 text-green-800',
      warning: 'border-warn/30 bg-warn/10 text-amber-800',
      destructive: 'border-danger/30 bg-danger/10 text-red-800',
      info: 'border-info/30 bg-info/10 text-blue-800',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>): React.JSX.Element {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'h5'>): React.JSX.Element {
  return <h5 data-slot="alert-title" className={cn('font-medium', className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element {
  return (
    <div data-slot="alert-description" className={cn('text-sm opacity-90', className)} {...props} />
  );
}

export { Alert, AlertTitle, AlertDescription };
