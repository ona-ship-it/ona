import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    },
    extend: {
      colors: {
        darkest: '#0b0d17', // Dark navbar color
        darkAccent: '#141622', // Lighter shade for hover or depth
        primary: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        pink: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843",
        },
        green: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#00e701", // BC.Games bright green
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        onaguiGreen: {
          light: "#34D399", // mint green
          DEFAULT: "#10B981", // emerald (main button color)
          dark: "#059669", // hover state
        },
        bcgames: {
        green: "#5AFF7F", // BC.Games bright green
        darkgrey: "#1A1D20", // BC.Games dark grey (navbar)
        lightgrey: "#36393e", // BC.Games lighter grey (cards)
        black: "#121212", // BC.Games darkest background
      },
        darker: {
          bg: "#1e2024", // BC.Games dark grey
          card: "#2f3237", // BC.Games lighter grey
          accent: "#00e701", // BC.Games bright green
          text: "#e5e7eb",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;