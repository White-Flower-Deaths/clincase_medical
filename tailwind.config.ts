import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#0f6e6a",
          deep: "#0a4f4c",
          bright: "#1a9b94",
        },
        ink: "#102a2a",
        paper: "#e8f0ee",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Source Sans 3", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
