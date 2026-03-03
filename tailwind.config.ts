import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0f00a1",
        secondary: "#ff5c00",
        accent: "#ffca00",
        dark: "#0e0f14",
        "background-light": "#FFFF",
        "background-dark": "#070039",
        "surface-light": "#fff2de",
        "surface-dark": "#1F2937",
      },
      fontFamily: {
        display: ["Montserrat", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
      animation: {
        marquee: "marquee 40s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
