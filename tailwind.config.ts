import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';
import animate from 'tailwindcss-animate';

const config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}', './messages/**/*.json'],
  theme: {
    extend: {
      colors: {
        page: 'var(--bg-page)',
        surface: 'var(--bg-surface)',
        muted: 'var(--bg-muted)',
        fg: { DEFAULT: 'var(--fg-primary)', muted: 'var(--fg-muted)' },
        border: 'var(--border)',
        accent: { DEFAULT: 'var(--accent)', fg: 'var(--accent-fg)' },
        danger: 'var(--danger)',
        warn: 'var(--warn)',
        success: 'var(--success)',
        info: 'var(--info)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
      },
      borderRadius: {
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      transitionDuration: {
        fast: 'var(--d-fast)',
        base: 'var(--d-base)',
        slow: 'var(--d-slow)',
      },
    },
  },
  plugins: [animate, typography],
} satisfies Config;

export default config;
