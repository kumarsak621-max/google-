import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#202124",
        muted: "#5f6368",
        line: "#dadce0",
        paper: "#f8f9fa",
        blue: "#1a73e8",
        "blue-dark": "#174ea6",
        surface: "#ffffff",
      },
      fontFamily: {
        sans: ["Google Sans", "Inter", "Roboto", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)",
      },
    },
  },
  plugins: [],
};

export default config;
