/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        unimed: {
          green: '#00A86E',
          yellow: '#f7d117',
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
