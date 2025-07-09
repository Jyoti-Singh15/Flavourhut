// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-accent': '#D45A2C', // Or #C74B3C
        'secondary-accent': '#8A9A5B', // Or #6B8E23
        'bg-light': '#FBFBFB', // Off-White/Cream
        'bg-light-alt': '#EFEFEF', // Slightly darker light gray/greige
        'text-heading': '#333333', // Charcoal Gray
        'text-body': '#555555', // Medium Gray
        'footer-bg': '#2C3E50', // Example dark footer background
      },
      fontFamily: {
        'heading': ['Montserrat', 'sans-serif'], // Or 'Lato'
        'body': ['Open Sans', 'sans-serif'],     // Or 'Roboto'
      },
      // You can also extend spacing, borderRadius, etc.
    },
  },
  plugins: [],
}