/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1a202c", // dark gray
        secondary: "#2d3748", // medium gray
        accent: "#4a5568", // light gray
        light: "#f7fafc", // off-white
      },
    },
  },
  plugins: [],
};
