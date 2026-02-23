/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        decode: {
          bg: 'var(--decode-bg)',
          article: 'var(--decode-article)',
          explanation: 'var(--decode-explanation)',
          muted: 'var(--decode-muted)',
          accent: 'var(--decode-accent)',
          highlight: 'var(--decode-highlight)',
          card: 'var(--decode-card)',
          cardBorder: 'var(--decode-cardBorder)',
          tagBg: 'var(--decode-tagBg)',
          tagText: 'var(--decode-tagText)',
          hover: 'var(--decode-hover)',
          highlightBorder: 'var(--decode-highlight-border)',
        },
      },
      fontFamily: {
        serif: ['var(--decode-font-serif)'],
        sans: ['var(--decode-font-sans)'],
        mono: ['var(--decode-font-mono)'],
      },
      borderRadius: {
        decode: 'var(--decode-radius)',
        'decode-sm': 'var(--decode-radius-sm)',
      },
      boxShadow: {
        decode: 'var(--decode-shadow)',
        'decode-lg': 'var(--decode-shadow-lg)',
      },
    },
  },
  plugins: [],
};
