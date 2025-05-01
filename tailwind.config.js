/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#03a9f4',
          dark: '#0276aa',
          light: '#67daff',
        },
        secondary: {
          DEFAULT: '#ff9800',
          dark: '#c66900',
          light: '#ffc947',
        },
      },
    },
  },
  plugins: [],
  // 防止 Tailwind 的樣式覆蓋 Ant Design Vue 的樣式
  corePlugins: {
    preflight: false,
  },
  important: false,
}