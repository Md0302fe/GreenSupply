/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Đường dẫn tới các tệp trong thư mục src
  ],
  theme: {
    extend: {
      colors: {
        customOrange: "#FF8B00",
        "supply-primary": "#FF8B00", // Cam đậm
        "supply-sec": "#ffc412", // Cam đậm
        "btn-blue": "#3872fa", // Màu nền chính của btn-blue
        "btn-blue-hover": "#3067e5", // Màu nền khi hover
      },
      fontFamily: {
        instrument: ['"Instrument Sans"', "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
      boxShadow: {
        "right-bottom": "8px 8px 2px rgba(0, 0, 0, 0.2)",
        "top-left": "-8px -8px 2px rgba(0, 0, 0, 0.2)",
      },
      animation: {
        "fade-in-down": "fadeInDown 0.4s ease-out both",
      },
      keyframes: {
        fadeInDown: {
          "0%": {
            opacity: 0,
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
      },
       screens: {
      'xs': '320px', // mobile S
      'xm': '375px', // mobile M
    }
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
};
