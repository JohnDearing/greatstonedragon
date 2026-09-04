import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ["var(--font-primary)"],
        display: ["var(--font-display)"],
      },
      colors: {
        brand: "var(--brand)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        gold: "var(--gold)",
      },
    },
  },
} satisfies Config;

