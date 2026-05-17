import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

import { AppLink } from '@/components/ui/app-link';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { getCategoryImage } from '@/features/home/home-assets';

type FeaturedCategory = {
  description: string | null;
  id: string;
  name: string;
  slug: string;
};

type FeaturedCategoriesProps = {
  categories: FeaturedCategory[];
  copy: {
    eyebrow: string;
    title: string;
    description: string;
    link: string;
  };
};

function FeaturedCategories({ categories, copy }: FeaturedCategoriesProps): React.JSX.Element {
  return (
    <Section className="bg-surface">
      <Container size="2xl">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
              {copy.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold">{copy.title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-fg-muted">{copy.description}</p>
          </div>
          <AppLink
            href="/shop"
            event="home.categories.view_all"
            className="text-sm text-emerald-600"
          >
            {copy.link}
            <ArrowRight aria-hidden className="ml-1 inline size-4" />
          </AppLink>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category, index) => (
            <AppLink
              key={category.id}
              href={`/shop/category/${category.slug}`}
              event="home.category.open"
              className="group overflow-hidden rounded-lg border border-border bg-surface hover:text-fg"
            >
              <div className="relative aspect-[1.62/1] overflow-hidden">
                <Image
                  alt=""
                  src={getCategoryImage(index)}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="flex items-center justify-between gap-4 p-4">
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="mt-1 line-clamp-1 text-sm text-fg-muted">{category.description}</p>
                </div>
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-page text-fg-muted">
                  <ArrowRight aria-hidden className="size-4" />
                </span>
              </div>
            </AppLink>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export { FeaturedCategories };
export type { FeaturedCategory };
