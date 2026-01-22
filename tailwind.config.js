/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundColor: {
        'blue-950/60': 'rgba(23, 37, 84, 0.6)',
        'blue-900/60': 'rgba(30, 58, 138, 0.6)',
        'blue-900/40': 'rgba(30, 58, 138, 0.4)',
        'white/5': 'rgba(255, 255, 255, 0.05)',
        'white/10': 'rgba(255, 255, 255, 0.1)',
        'white/20': 'rgba(255, 255, 255, 0.2)',
        'black/30': 'rgba(0, 0, 0, 0.3)',
        'black/60': 'rgba(0, 0, 0, 0.6)',
        'black/80': 'rgba(0, 0, 0, 0.8)',
      },
      borderColor: {
        'white/5': 'rgba(255, 255, 255, 0.05)',
        'white/10': 'rgba(255, 255, 255, 0.1)',
        'white/20': 'rgba(255, 255, 255, 0.2)',
        'blue-500/30': 'rgba(59, 130, 246, 0.3)',
        'green-500/30': 'rgba(34, 197, 94, 0.3)',
      },
      textColor: {
        'white/5': 'rgba(255, 255, 255, 0.05)',
        'white/10': 'rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'blue': {
          '950': '#172554',
          '900': '#1e3a8a',
          '800': '#1e40af',
          '600': '#2563eb',
        },
      },
      opacity: {
        '60': '0.6',
        '40': '0.4',
      },
    },
  },
  plugins: [],
  important: true,
}
