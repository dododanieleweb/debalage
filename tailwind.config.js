/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  '#FDFAF5',
          100: '#FAF5EB',
          200: '#F3E8D0',
          300: '#E8D5B0',
          400: '#D9BC88',
          500: '#C9A461',
        },
        vintage: {
          50:  '#FDF8F2',
          100: '#F7EDDF',
          200: '#EDD9BC',
          300: '#DEC08E',
          400: '#CFA365',
          500: '#B8893E',
          600: '#9A7030',
          700: '#7C5A25',
          800: '#5E441C',
          900: '#402E13',
        },
        bark: {
          50:  '#F9F5F0',
          100: '#EDE4D8',
          200: '#D9C9B1',
          300: '#C0A882',
          400: '#A8875A',
          500: '#8B6A3E',
          600: '#6F5230',
          700: '#553E25',
          800: '#3C2B1A',
          900: '#241910',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
