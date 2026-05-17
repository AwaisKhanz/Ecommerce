import { Container } from '@/components/ui/container';

function ShopLoading(): React.JSX.Element {
  return (
    <Container size="2xl" className="py-8">
      <div className="h-8 w-56 animate-pulse rounded bg-muted" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
        <div className="h-[520px] animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="h-[430px] animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </Container>
  );
}

export default ShopLoading;
