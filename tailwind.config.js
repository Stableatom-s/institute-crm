/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crm: {
          sidebar: "#0B0E1E",
          sidebarActive: "#1A2035",
          yellow: "#FBBF24",
          yellowHover: "#F59E0B",
          cardBg: "#FFFFFF",
          bg: "#F8FAFC",
          border: "#E2E8F0",
          textPrimary: "#0F172A",
          textMuted: "#64748B",
        }
      }
    },
  },
  plugins: [],
};