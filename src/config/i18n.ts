export const locales = ['en', 'ar'] as const;
export const defaultLocale = 'en';
export type Locale = (typeof locales)[number];

export const rtlLocales: ReadonlyArray<Locale> = ['ar'];
export const isRtl = (locale: Locale): boolean => rtlLocales.includes(locale);
