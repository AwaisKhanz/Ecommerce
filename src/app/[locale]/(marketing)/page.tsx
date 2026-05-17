import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { categoryService } from '@/features/catalog/server/categories.service';
import { productService } from '@/features/catalog/server/products.service';
import { FeaturedCategories } from '@/features/home/components/featured-categories';
import { FeaturedProducts } from '@/features/home/components/featured-products';
import { HomeHero } from '@/features/home/components/home-hero';
import { QuoteCta } from '@/features/home/components/quote-cta';
import { ServicesSection } from '@/features/home/components/services-section';
import { TrustStrip } from '@/features/home/components/trust-strip';
import { siteConfig } from '@/config/site';
import type { Locale } from '@/config/i18n';

type HomePageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.meta' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function HomePage({ params }: HomePageProps): Promise<React.JSX.Element> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });
  const [{ items: featuredProducts }, categories] = await Promise.all([
    productService.list({ tag: 'featured', perPage: 8 }, locale),
    categoryService.listActive(locale),
  ]);

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.supportEmail,
    telephone: siteConfig.phone,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <HomeHero
        copy={{
          badge: t('hero.badge'),
          titleLead: t('hero.titleLead'),
          titleAccent: t('hero.titleAccent'),
          description: t('hero.description'),
          primaryCta: t('hero.primaryCta'),
          secondaryCta: t('hero.secondaryCta'),
          stats: [
            { label: t('hero.stats.years.label'), value: t('hero.stats.years.value') },
            { label: t('hero.stats.orders.label'), value: t('hero.stats.orders.value') },
            { label: t('hero.stats.rating.label'), value: t('hero.stats.rating.value') },
          ],
          productLabel: t('hero.productLabel'),
          warrantyTitle: t('hero.warrantyTitle'),
          warrantyDescription: t('hero.warrantyDescription'),
        }}
      />
      <TrustStrip
        items={[
          { title: t('trust.delivery.title'), description: t('trust.delivery.description') },
          { title: t('trust.warranty.title'), description: t('trust.warranty.description') },
          { title: t('trust.support.title'), description: t('trust.support.description') },
          { title: t('trust.brands.title'), description: t('trust.brands.description') },
        ]}
      />
      <FeaturedCategories
        categories={categories.slice(0, 6)}
        copy={{
          eyebrow: t('categories.eyebrow'),
          title: t('categories.title'),
          description: t('categories.description'),
          link: t('categories.link'),
        }}
      />
      <FeaturedProducts
        products={featuredProducts}
        locale={locale}
        copy={{
          eyebrow: t('products.eyebrow'),
          title: t('products.title'),
          description: t('products.description'),
          link: t('products.link'),
          inStock: t('products.inStock'),
          lowStock: t('products.lowStock'),
          sale: t('products.sale'),
        }}
      />
      <ServicesSection
        copy={{
          eyebrow: t('services.eyebrow'),
          title: t('services.title'),
          link: t('services.link'),
          request: t('services.request'),
        }}
        services={[
          {
            title: t('services.installation.title'),
            description: t('services.installation.description'),
          },
          { title: t('services.repair.title'), description: t('services.repair.description') },
          {
            title: t('services.consultation.title'),
            description: t('services.consultation.description'),
          },
        ]}
      />
      <QuoteCta
        phone={siteConfig.phone}
        copy={{
          title: t('quote.title'),
          description: t('quote.description'),
          cta: t('quote.cta'),
        }}
      />
    </>
  );
}
