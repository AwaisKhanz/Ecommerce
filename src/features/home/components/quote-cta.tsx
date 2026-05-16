import { ArrowRight, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Link } from '@/lib/i18n/navigation';

type QuoteCtaProps = {
  copy: {
    title: string;
    description: string;
    cta: string;
  };
  phone: string;
};

function QuoteCta({ copy, phone }: QuoteCtaProps): React.JSX.Element {
  return (
    <section className="bg-surface pb-12 lg:pb-20">
      <Container size="2xl">
        <div className="flex flex-col gap-6 rounded-xl bg-emerald-700 px-6 py-7 text-white sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <h2 className="font-display text-2xl font-semibold">{copy.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/80">
              {copy.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex h-11 items-center gap-2 rounded-md bg-white/10 px-4 text-sm">
              <Phone aria-hidden className="size-4" />
              {phone}
            </span>
            <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50">
              <Link href="/contact">
                {copy.cta}
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

export { QuoteCta };
