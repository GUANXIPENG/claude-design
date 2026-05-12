import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f7f4ef",
        ink: "#1f2933",
        muted: "#667085",
        line: "#ded7cc",
        accent: "#2f6f73"
      }
    }
  },
  plugins: []
};

export default config;
