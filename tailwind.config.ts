import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mist: {
          50: '#f6f7f9',
          0: '#ffffff',
          25: '#f9fafb',
        },
        slate: {
          900: '#0f172a',
          500: '#64748b',
          200: '#e2e8f0',
        },
        calm: {
          blue: {
            50: '#eef4ff',
            500: '#4f8cff',
          },
        },
        meadow: {
          500: '#22c55e',
        },
        rose: {
          500: '#ef4444',
        },
      },
    },
  },
  plugins: [],
};

export default config;
