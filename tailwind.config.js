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
        background: '#f7f2eb',
        surface: '#fffdf9',
        accent: '#d97d3f',
        accentDark: '#b25624',
        textPrimary: '#2f2b24',
        textSecondary: '#6f665c',
        border: '#eadfd0'
      },
      boxShadow: {
        soft: '0 18px 36px rgba(90, 62, 35, 0.12)'
      }
    }
  },
  plugins: []
};
