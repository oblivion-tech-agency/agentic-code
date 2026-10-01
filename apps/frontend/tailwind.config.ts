import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: 'var(--surface)',
        'surface-foreground': 'var(--surface-foreground)',
        'surface-border': 'var(--surface-border)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        muted: 'var(--muted)',
        danger: 'var(--danger)',
        'surface-elevated': 'var(--surface-elevated)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        'aria-bg': 'var(--aria-bg)',
        'aria-accent': 'var(--aria-accent)',
        'aria-accent-soft': 'var(--aria-accent-soft)',
        'aria-success': 'var(--aria-success)',
        'aria-danger': 'var(--aria-danger)',
        'aria-warning': 'var(--aria-warning)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
  plugins: [],
};
export default config;
