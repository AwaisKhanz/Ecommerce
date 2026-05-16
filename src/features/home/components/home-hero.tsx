import { ArrowRight, Play, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Link } from '@/lib/i18n/navigation';

type HomeHeroCopy = {
  badge: string;
  titleLead: string;
  titleAccent: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  stats: readonly { label: string; value: string }[];
  productLabel: string;
  warrantyTitle: string;
  warrantyDescription: string;
};

type HomeHeroProps = {
  copy: HomeHeroCopy;
};

function HomeHero({ copy }: HomeHeroProps): React.JSX.Element {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(rgba(34,197,94,0.18) 1px, transparent 1px), radial-gradient(circle at 25% 20%, rgba(34,197,94,0.12), transparent 30%)',
          backgroundSize: '18px 18px, auto',
        }}
      />

      <Container
        size="2xl"
        className="relative grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] lg:items-center lg:py-16"
      >
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            {copy.badge}
          </span>

          <h1 className="mt-6 max-w-xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            {copy.titleLead}
            <span className="block text-emerald-300">{copy.titleAccent}</span>
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-400 sm:text-base">
            {copy.description}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-md px-5">
              <Link href="/shop">
                {copy.primaryCta}
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
            >
              <Link href="/services">
                <Play aria-hidden className="size-3 fill-current" />
                {copy.secondaryCta}
              </Link>
            </Button>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {copy.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-xs text-zinc-500">{stat.label}</dt>
                <dd className="order-first mb-1 font-display text-2xl font-semibold">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="relative aspect-[1.02/1] overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl">
            <Image
              alt="Industrial generator being serviced"
              src="/images/home/hero-generator.webp"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 520px, 100vw"
            />
            <span className="absolute left-4 top-4 rounded bg-emerald-500 px-2 py-1 text-[11px] font-semibold text-white">
              Best seller
            </span>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/90 to-transparent p-5 pt-16">
              <p className="font-display text-xl font-semibold">{copy.productLabel}</p>
            </div>
          </div>

          <div className="absolute -bottom-4 left-4 inline-flex items-center gap-3 rounded-lg border border-border bg-white px-4 py-3 text-zinc-950 shadow-lg sm:left-[-1rem]">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ShieldCheck aria-hidden className="size-4" />
            </span>
            <span>
              <span className="block text-xs font-semibold">{copy.warrantyTitle}</span>
              <span className="block text-[11px] text-zinc-500">{copy.warrantyDescription}</span>
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}

export { HomeHero };
export type { HomeHeroCopy };
