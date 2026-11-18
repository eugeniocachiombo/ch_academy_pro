import primeui from 'tailwindcss-primeui'

export default {
  darkMode: ['selector', '.dark'],
  content: ['./index.html', './src/**/*.{vue,ts,js}'],
  plugins: [primeui],
}