/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Đường dẫn tới các tệp trong thư mục src
  ],
  theme: {
    extend: {
      colors: {
        customOrange: '#FF8B00',
      },
      fontFamily: {
        instrument: ['"Instrument Sans"', 'sans-serif'],
      },
      boxShadow: {
        'right-bottom': "8px 8px 2px rgba(0, 0, 0, 0.2)",
        'top-left': "-8px -8px 2px rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
};
