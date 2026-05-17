import { Check, Headphones, ShieldCheck, Truck } from 'lucide-react';

import { Container } from '@/components/ui/container';

const trustIcons = [Truck, ShieldCheck, Headphones, Check] as const;

type TrustItem = {
  description: string;
  title: string;
};

type TrustStripProps = {
  items: readonly TrustItem[];
};

function TrustStrip({ items }: TrustStripProps): React.JSX.Element {
  return (
    <section className="border-b border-border bg-surface">
      <Container size="2xl" className="grid gap-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => {
          const Icon = trustIcons[index % trustIcons.length] ?? Check;

          return (
            <div key={item.title} className="flex items-center gap-3">
              <span className="inline-flex size-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                <Icon aria-hidden className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-medium">{item.title}</span>
                <span className="block text-xs text-fg-muted">{item.description}</span>
              </span>
            </div>
          );
        })}
      </Container>
    </section>
  );
}

export { TrustStrip };
export type { TrustItem };
