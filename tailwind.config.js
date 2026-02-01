/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        popover: "hsl(220, 15%, 18%)", // example dark background
        "popover-foreground": "hsl(210, 40%, 98%)", // example light text
      },
    },
  },
  plugins: [],
};
