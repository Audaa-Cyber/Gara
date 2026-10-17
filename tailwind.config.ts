import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: {
    fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] },
    colors: { ink: "#171815", paper: "#f7f7f2", moss: "#b6c5a3", line: "#e4e5dc" },
    boxShadow: { soft: "0 24px 80px rgba(30, 35, 25, 0.08)" },
  }},
  plugins: [],
};
export default config;
