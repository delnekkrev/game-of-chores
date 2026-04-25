/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      animation: {
        bounce: 'bounce 1s infinite',
      }
    },
  },
  plugins: [],
}
