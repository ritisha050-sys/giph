/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#12233F',
        navy2: '#1B3358',
        paper: '#F6F2E9',
        paper2: '#EFE8D8',
        ink: '#1C1B18',
        inksoft: '#4A473F',
        ochre: '#B9812B',
        ocheresoft: '#E7CE9B',
        forest: '#2F5D45',
        forestsoft: '#DCE9DF',
        brick: '#96453F',
        bricksoft: '#EFDBD8',
        slate: '#5B6472'
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        serif: ['Source Serif 4', 'serif'],
        mono: ['IBM Plex Mono', 'monospace']
      }
    }
  },
  plugins: []
};