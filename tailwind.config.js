/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./catalog.html",
    "./delivery.html",
    "./superadmin.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        saas: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          elevated: '#F1F5F9',
          border: '#E2E8F0',
          text: '#0F172A',
          muted: '#64748B',
          primary: '#0284C7',
          hover: '#0369A1',
          pillBg: '#E0F2FE',
          actionRed: '#EF4444',
          success: '#15803D',
          warning: '#B45309',
          error: '#B91C1C',
          info: '#0369A1',
        }
      },
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        syne: ['"Plus Jakarta Sans"', 'sans-serif'],
        outfit: ['"Outfit"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
