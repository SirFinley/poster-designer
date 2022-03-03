module.exports = {
  purge: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#231F20',
        warmblack: '#231F20',
        coolblack: '#201F23',
        offgray: '#434143',
        vipurple: '#6635CF',
        vipurplelight: '#9645FF',
      },
    },
  },
  plugins: [],
}
