/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#effafa',
        surface: '#ffffff',
        accent: '#14b8c9',
        accentDark: '#0e7c8c',
        coral: '#ff8fa3',
        textPrimary: '#173f42',
        textSecondary: '#5f7f83',
        border: '#d7eeee'
      },
      boxShadow: {
        soft: '0 18px 36px rgba(14, 124, 140, 0.14)'
      },
      fontFamily: {
        sans: ['var(--font-zen-maru)', '"Zen Maru Gothic"', '"Noto Sans JP"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
