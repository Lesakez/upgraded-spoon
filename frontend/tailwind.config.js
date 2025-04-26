/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-primary': '#1A1F2C',
        'game-secondary': '#2C3645',
        'game-accent': '#4F46E5',
        'game-gold': '#FFD700',
        'game-silver': '#C0C0C0',
        'game-bronze': '#CD7F32',
      },
      backgroundImage: {
        'game-gradient': 'linear-gradient(to bottom, #1A1F2C, #2C3645)',
      },
      fontFamily: {
        'game': ['MedievalSharp', 'serif'],
      },
    },
  },
  plugins: [],
}