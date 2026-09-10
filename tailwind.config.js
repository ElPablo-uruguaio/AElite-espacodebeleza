/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#fff5f7',
          100: '#ffe6ec',
          200: '#fcccd8',
          300: '#f9a3b8',
          400: '#f46a8d',
          500: '#e83e6b',
          600: '#d42152',
          700: '#b21540',
          800: '#941539',
          900: '#7d1634',
        },
        gold: {
          400: '#f3c669',
          500: '#d4af37',
          600: '#aa820a',
        },
        salon: {
          dark: '#121214',
          card: '#1a1a1e',
          accent: '#e8a598',
          gold: '#d4af37',
          cream: '#faf6f0'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
