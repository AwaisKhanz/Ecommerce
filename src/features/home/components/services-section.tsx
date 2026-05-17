import { ArrowRight, Headphones, ShieldCheck, Wrench } from 'lucide-react';

import { AppLink } from '@/components/ui/app-link';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';

const serviceIcons = [ShieldCheck, Wrench, Headphones] as const;

type ServiceItem = {
  description: string;
  title: string;
};

type ServicesSectionProps = {
  copy: {
    eyebrow: string;
    title: string;
    link: string;
    request: string;
  };
  services: readonly ServiceItem[];
};

function ServicesSection({ copy, services }: ServicesSectionProps): React.JSX.Element {
  return (
    <Section className="bg-surface">
      <Container size="2xl">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
              {copy.eyebrow}
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight">
              {copy.title}
            </h2>
          </div>
          <AppLink
            href="/services"
            event="home.services.view_all"
            className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm hover:bg-page"
          >
            {copy.link}
            <ArrowRight aria-hidden className="ml-1 size-4" />
          </AppLink>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = serviceIcons[index % serviceIcons.length] ?? ShieldCheck;

            return (
              <article
                key={service.title}
                className="rounded-lg border border-border bg-surface p-6"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                  <Icon aria-hidden className="size-5" />
                </span>
                <h3 className="mt-6 text-lg font-semibold">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-fg-muted">{service.description}</p>
                <AppLink
                  href="/contact"
                  event="home.services.request"
                  className="mt-5 inline-block text-sm text-emerald-600"
                >
                  {copy.request}
                  <ArrowRight aria-hidden className="ml-1 inline size-4" />
                </AppLink>
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

export { ServicesSection };
export type { ServiceItem };
