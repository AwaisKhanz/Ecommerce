import type { Metadata } from 'next';

import { inter, spaceGrotesk } from '@/styles/fonts';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Industrial Shop',
  description: 'Industrial e-commerce platform foundation.',
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>{children}</body>
    </html>
  );
}
