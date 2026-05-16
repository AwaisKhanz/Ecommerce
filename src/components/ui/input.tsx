import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>): React.JSX.Element {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'focus-visible:ring-accent/20 aria-invalid:border-danger aria-invalid:ring-danger/20 h-10 w-full min-w-0 rounded-md border border-border bg-surface px-3 text-sm text-fg outline-none transition-colors placeholder:text-fg-muted focus-visible:border-accent focus-visible:ring-2 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
