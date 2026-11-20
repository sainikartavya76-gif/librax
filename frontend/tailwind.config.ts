import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // LibraX Design Tokens — Light
        'lx-bg': '#f5f0e8',          // warm ivory
        'lx-surface': '#ffffff',
        'lx-surface-2': '#f0ebe2',
        'lx-border': '#ddd8cf',
        'lx-text': '#1a1810',        // deep ink
        'lx-text-2': '#5a5348',      // stone gray
        'lx-text-muted': '#8a8278',
        'lx-accent': '#2d6a4f',      // forest green
        'lx-accent-hover': '#245940',
        'lx-accent-light': '#eef5f1',
        'lx-amber': '#b45309',
        'lx-amber-bg': '#fef3c7',
        'lx-red': '#b91c1c',
        'lx-red-bg': '#fee2e2',
        'lx-blue': '#1d4ed8',
        'lx-blue-bg': '#dbeafe',

        // LibraX Design Tokens — Dark
        'lx-dark-bg': '#0d0f13',        // very deep charcoal
        'lx-dark-surface': '#141720',    // slightly lighter
        'lx-dark-surface-2': '#1c2030',  // card surface
        'lx-dark-border': '#252a38',
        'lx-dark-border-2': '#2e3448',
        'lx-dark-text': '#e8e4dc',       // warm white
        'lx-dark-text-2': '#8f9ab0',     // muted blue-gray
        'lx-dark-text-muted': '#5e6a80',
        'lx-dark-accent': '#3d8b6a',     // lighter green for dark
        'lx-dark-accent-hover': '#4aa07c',
        'lx-dark-accent-bg': '#1a2e26',
        'lx-dark-amber': '#d97706',
        'lx-dark-amber-bg': '#1f1200',
        'lx-dark-red': '#ef4444',
        'lx-dark-red-bg': '#1f0808',
        'lx-dark-blue': '#60a5fa',
        'lx-dark-blue-bg': '#0c1829',

        // Semantic aliases (CSS variables will be used)
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--color-surface-2) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        'ink-2': 'rgb(var(--color-ink-2) / <alpha-value>)',
        'ink-muted': 'rgb(var(--color-ink-muted) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'accent-hover': 'rgb(var(--color-accent-hover) / <alpha-value>)',
        'accent-bg': 'rgb(var(--color-accent-bg) / <alpha-value>)',
        'warn': 'rgb(var(--color-warn) / <alpha-value>)',
        'warn-bg': 'rgb(var(--color-warn-bg) / <alpha-value>)',
        'crit': 'rgb(var(--color-crit) / <alpha-value>)',
        'crit-bg': 'rgb(var(--color-crit-bg) / <alpha-value>)',
        'info': 'rgb(var(--color-info) / <alpha-value>)',
        'info-bg': 'rgb(var(--color-info-bg) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        'xs': ['0.75rem', { lineHeight: '1.125rem' }],
        'sm': ['0.8125rem', { lineHeight: '1.25rem' }],
        'base': ['0.875rem', { lineHeight: '1.375rem' }],
        'md': ['0.9375rem', { lineHeight: '1.5rem' }],
        'lg': ['1rem', { lineHeight: '1.5rem' }],
        'xl': ['1.125rem', { lineHeight: '1.625rem' }],
        '2xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '3xl': ['1.5rem', { lineHeight: '2rem' }],
        '4xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
        'inner-sm': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.06)',
        // Dark mode shadows
        'dark-sm': '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.2)',
        'dark-md': '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.2)',
        'dark-lg': '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
      },
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
      },
      animation: {
        'fade-in': 'fade-in 0.15s ease-out',
        'slide-in': 'slide-in 0.2s ease-out',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
