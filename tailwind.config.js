/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Đường dẫn tới các tệp trong thư mục src
  ],
  theme: {
    extend: {
      colors: {
        "supply-primary": '#FF8B00', // Cam đậm
        "supply-sec": '#ffc412', // Cam đậm
      },
    },
  },
  plugins: [],
};
