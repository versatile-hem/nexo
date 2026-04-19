import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nexo: {
          bg: "#f4f6ef",
          ink: "#142013",
          accent: "#2c7a4b",
          accentSoft: "#d8ead8",
          danger: "#b43f3f",
        },
      },
      boxShadow: {
        card: "0 8px 24px rgba(20, 32, 19, 0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
