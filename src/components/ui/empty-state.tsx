import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
};

function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
}: EmptyStateProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface p-8 text-center',
        className,
      )}
    >
      {Icon ? <Icon aria-hidden className="mb-3 size-5 text-fg-muted" /> : null}
      <h3 className="font-display text-base font-semibold">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-fg-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
