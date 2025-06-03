// tailwind.config.js
module.exports = {
    content: [
      "./src/**/*.{html,js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
        Quicksand: ['var(--font-quicksand)', 'sans-serif']
      },
    },
    plugins: [],
  }
}