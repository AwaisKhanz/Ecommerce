import { LoaderCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

type LoaderProps = {
  className?: string;
  label?: string;
};

function Loader({ className, label = 'Loading' }: LoaderProps): React.JSX.Element {
  return (
    <div
      className={cn('inline-flex items-center gap-2 text-sm text-fg-muted', className)}
      role="status"
    >
      <LoaderCircle aria-hidden className="size-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export { Loader };
