/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#111827", // dark gray
        secondary: "#000000", // pure black
        accent: "#DC2626", // vibrant red
        neutral: "#9CA3AF", // cool gray
        dark: "#111827", // dark text
        light: "#FFFFFF", // pure white text
      },
    },
  },
  plugins: [],
};
