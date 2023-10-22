/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'black-900': '#141414',
        'blue-600': '#2d323e',
        'blue-500': '#03a9f4',
        'blue-400': '#64b5f6',
        'blue-100': '#bbdefb',
        'gray-700': '#bcaaa4',
        'gray-400': '#efebe9',
        'gray-300': '#bdc3c7',
        'gray-200': '#c1c6e2',
        'gray-100': '#f5f5f5'
      }
    }
  },
  plugins: []
};
