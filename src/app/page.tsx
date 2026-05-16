export default function HomePage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="max-w-xl rounded-lg border bg-surface p-8 shadow-sm">
        <p className="text-sm text-fg-muted">Phase 0 foundation</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">industrial-shop</h1>
        <p className="mt-4 text-fg-muted">
          Project scaffold, tooling, tokens, and environment validation are being prepared before
          any production screens are implemented.
        </p>
      </section>
    </main>
  );
}
