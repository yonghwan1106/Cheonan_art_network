/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff8fa',
          100: '#ffe2e8',
          200: '#ffc2d1',
          300: '#ff7b91',
          400: '#ff4d6d',
          500: '#ff1744',
          600: '#e91e63',
          700: '#c2185b',
          800: '#ad1457',
          900: '#880e4f',
        },
        congestion: {
          low: '#10b981',    // 녹색 - 여유
          medium: '#f59e0b', // 노란색 - 보통
          high: '#ef4444',   // 빨간색 - 혼잡
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}