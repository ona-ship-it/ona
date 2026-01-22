/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'dark-navy': '#0f0f23',
        'card-dark': '#1a1a2e',
      },
      backgroundColor: {
        'white/5': 'rgba(255, 255, 255, 0.05)',
        'white/10': 'rgba(255, 255, 255, 0.1)',
        'white/20': 'rgba(255, 255, 255, 0.2)',
        'black/20': 'rgba(0, 0, 0, 0.2)',
        'black/60': 'rgba(0, 0, 0, 0.6)',
        'black/80': 'rgba(0, 0, 0, 0.8)',
      },
      borderColor: {
        'white/5': 'rgba(255, 255, 255, 0.05)',
        'white/10': 'rgba(255, 255, 255, 0.1)',
        'white/20': 'rgba(255, 255, 255, 0.2)',
        'blue-500/30': 'rgba(59, 130, 246, 0.3)',
        'blue-500/50': 'rgba(59, 130, 246, 0.5)',
        'green-500/30': 'rgba(34, 197, 94, 0.3)',
      },
      boxShadow: {
        'blue-glow': '0 0 30px rgba(59, 130, 246, 0.5)',
        'blue-glow-20': '0 0 20px rgba(59, 130, 246, 0.2)',
      },
      backgroundImage: {
        'blue-950/60': 'linear-gradient(rgba(23, 37, 84, 0.6), rgba(23, 37, 84, 0.6))',
        'blue-900/60': 'linear-gradient(rgba(30, 58, 138, 0.6), rgba(30, 58, 138, 0.6))',
        'blue-900/40': 'linear-gradient(rgba(30, 58, 138, 0.4), rgba(30, 58, 138, 0.4))',
      },
    },
  },
  plugins: [],
}
