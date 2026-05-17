type ShopEmptyStateProps = {
  description: string;
  title: string;
};

function ShopEmptyState({ description, title }: ShopEmptyStateProps): React.JSX.Element {
  return (
    <section className="rounded-lg border border-border bg-surface px-6 py-16 text-center">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-3 text-sm text-fg-muted">{description}</p>
    </section>
  );
}

export { ShopEmptyState };
