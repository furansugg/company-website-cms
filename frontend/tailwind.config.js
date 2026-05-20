/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcd9ff',
          300: '#8ec1ff',
          400: '#5b9eff',
          500: '#3179ff',
          600: '#2261e6',
          700: '#1b4fbf',
          800: '#1a4399',
          900: '#1b3a7e',
        },
      },
    },
  },
  plugins: [],
};
