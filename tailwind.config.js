/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#0f172a',
        },
        pale: {
          50: '#ffffff',
          100: '#f8fafc',
          200: '#f0f4f8',
          300: '#e2e8f0',
          400: '#cbd5e1',
          500: '#94a3b8',
        },
        dark: {
          950: '#f0f4f8',
          900: '#ffffff',
          800: '#f8fafc',
          700: '#f1f5f9',
          600: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(2, 132, 199, 0.15)' },
          '100%': { boxShadow: '0 0 25px rgba(2, 132, 199, 0.35)' },
        }
      }
    },
  },
  plugins: [],
}
