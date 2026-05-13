/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm:   ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        base:    '#0e0e0e',
        card:    '#161616',
        card2:   '#1c1c1c',
        hover:   '#222222',
        accent:  '#6effa0',
        t1:      '#f0f0f0',
        t2:      '#8a8a8a',
        t3:      '#555555',
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.07)',
        mid:     'rgba(255,255,255,0.12)',
        accent:  '#6effa0',
      },
    },
  },
  plugins: [],
}
