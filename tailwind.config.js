/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#06b6d4',
        'neon-green': '#22c55e',
        'neon-purple': '#a855f7',
        'neon-orange': '#f97316',
      }
    },
  },
  plugins: [],
}
