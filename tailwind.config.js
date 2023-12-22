/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html, ts}"
  ],
  theme: {
    extend: {
      colors: {
        "neutral-925": "rgb(17, 17, 17)",
        "neutral-850": "rgb(30, 30, 30)",
        "neutral-750": "rgb(51, 51, 51)",
      },
      screens: {
        print: {raw: 'print'},
        screen: {raw: 'screen'},
      }
    },
  },
  plugins: [],
}

