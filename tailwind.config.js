/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          900: '#34060e',
          800: '#4a0d18',
          700: '#671424',
        },
        gold: {
          DEFAULT: '#d4af37',
          light: '#f7e7a9',
          deep: '#b38728',
          foil: '#cf9937',
        },
        navy: {
          deep: '#0f172a',
          soft: '#1e293b',
        },
        ivory: '#faf7f2',
        blush: '#fff5f5',
      },
      fontFamily: {
        script: ['"Dancing Script"', 'cursive'],
        serifSc: ['"Marcellus SC"', 'serif'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(212, 175, 55, 0.25)',
        'gold-card': '0 10px 30px -5px rgba(74, 13, 24, 0.12), 0 0 0 1px rgba(212, 175, 55, 0.3)',
      }
    },
  },
  plugins: [],
}
