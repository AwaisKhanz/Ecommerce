import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>): React.JSX.Element {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'focus-visible:ring-accent/20 aria-invalid:border-danger aria-invalid:ring-danger/20 min-h-24 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors placeholder:text-fg-muted focus-visible:border-accent focus-visible:ring-2 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
