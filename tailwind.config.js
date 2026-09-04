/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        royal: {
          950: '#07030e',
          900: '#0d071d',
          850: '#130c29',
          800: '#1b1238',
          700: '#2a1d52',
          600: '#3e2c77',
        },
        gold: {
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        crimson: {
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        cinzel: ['Cinzel', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
        sans: ['Outfit', 'Inter', 'sans-serif'],
        cormorant: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        'luxury-serif': ['"Cormorant Garamond"', '"Playfair Display"', 'Bodoni MT', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'sparkle': 'sparkle 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(245, 158, 11, 0.35)',
        'rose-glow': '0 0 25px rgba(244, 63, 94, 0.35)',
        'royal-card': '0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 215, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
