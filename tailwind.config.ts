import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#00aff0",
          hover: "#008fca",
        },
        "of-gray": "#8a96a3",
        "of-light": "#f2f5f7",
        "of-dark": "#242529",
      },
    },
  },
  plugins: [],
} satisfies Config;
