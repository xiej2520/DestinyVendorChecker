/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#ef70ab",
          secondary: "#3897b7",
          accent: "#f47af0",
          neutral: "#0d0c16",
          "base-100": "#212030",
          info: "#a7d7ec",
          success: "#71efb0",
          warning: "#f0c414",
          error: "#e77874",
        },
      },
    ],
  },
  theme: {
    extend: {},
  },
  plugins: [daisyui],
};
