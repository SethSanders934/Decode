/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        decode: {
          bg: '#FAFAF8',
          article: '#1A1A1A',
          explanation: '#2D2D2D',
          muted: '#6B6B6B',
          accent: '#4A6FA5',
          highlight: '#FFF9E6',
          card: '#FFFFFF',
          cardBorder: '#E8E8E4',
          tagBg: '#EEF2F7',
          tagText: '#4A6FA5',
          hover: '#FDFDF8',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Merriweather', 'Charter', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
