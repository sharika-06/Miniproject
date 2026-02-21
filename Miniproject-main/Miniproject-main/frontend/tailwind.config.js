/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        neuro: {
          bg: 'rgb(var(--color-bg) / <alpha-value>)',
          card: 'rgb(var(--color-card) / <alpha-value>)',
          lighter: 'rgb(var(--color-lighter) / <alpha-value>)',
          text: 'rgb(var(--color-text) / <alpha-value>)',
          muted: 'rgb(var(--color-muted) / <alpha-value>)',
          accent: 'rgb(var(--color-accent) / <alpha-value>)',
          border: 'rgb(var(--color-border) / <alpha-value>)',
          danger: '#EF4444',
          success: '#10b981',
          warning: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        batman: ['BatmanForeverAlternate', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
