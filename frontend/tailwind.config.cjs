/** @type {import('tailwindcss').Config} */
const { shadcnUi } = require('shadcn-ui/tailwind');

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        unimed: {
          green: '#00a859',
          yellow: '#f7d117',
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [shadcnUi],
};
