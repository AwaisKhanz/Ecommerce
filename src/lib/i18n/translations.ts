import { defaultLocale } from '@/config/i18n';

type TranslatableRow = {
  translations: unknown;
};

function getLocaleTranslation(
  translations: unknown,
  locale: string,
): Record<string, unknown> | undefined {
  if (!translations || typeof translations !== 'object' || Array.isArray(translations)) {
    return undefined;
  }

  const candidate = (translations as Record<string, unknown>)[locale];

  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return undefined;
  }

  return candidate as Record<string, unknown>;
}

export function pickTranslatedFields<T extends TranslatableRow, K extends keyof T>(
  row: T,
  locale: string,
  fields: readonly K[],
): T {
  if (locale === defaultLocale) return row;

  const translation = getLocaleTranslation(row.translations, locale);
  if (!translation) return row;

  return fields.reduce<T>((localized, field) => {
    const translatedValue = translation[String(field)];

    if (translatedValue === undefined || translatedValue === null) {
      return localized;
    }

    return {
      ...localized,
      [field]: translatedValue as T[K],
    };
  }, row);
}
