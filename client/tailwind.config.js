/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#173D42',
          light: '#4A6A6D',
          dark: '#00212A'
        },
        secondary: {
          DEFAULT: '#3DAEAA',
          light: '#69C2C4',
          dark: '#2F8686'
        }
      }
    }
  },
  variants: {},
  plugins: [],
}