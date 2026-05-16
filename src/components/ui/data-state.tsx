import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Loader } from '@/components/ui/loader';

type DataStateProps = {
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  loadingLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  children: React.ReactNode;
};

function DataState({
  isLoading = false,
  error = null,
  isEmpty = false,
  loadingLabel,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  children,
}: DataStateProps): React.JSX.Element {
  if (isLoading) return <Loader label={loadingLabel} />;
  if (error) return <ErrorState description={error} />;
  if (isEmpty) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return <>{children}</>;
}

export { DataState };
