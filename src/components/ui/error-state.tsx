import { CircleAlert } from 'lucide-react';

import { cn } from '@/lib/utils';

type ErrorStateProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again.',
  action,
  className,
}: ErrorStateProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'border-danger/30 bg-danger/10 flex flex-col items-center justify-center rounded-lg border p-8 text-center',
        className,
      )}
    >
      <CircleAlert aria-hidden className="mb-3 size-5 text-danger" />
      <h3 className="font-display text-base font-semibold text-fg">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-fg-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export { ErrorState };
