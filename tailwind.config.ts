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
        // الهوية الرسمية لوزارة التعليم السعودية
        moe: {
          50: "#f0fdf9",
          100: "#ccfbef",
          200: "#99f6e0",
          300: "#5eead1",
          400: "#2dd4b8",
          500: "#14b89d",
          600: "#0d9480",
          700: "#0f766e",
          800: "#115e57",
          900: "#0b4d47",
          950: "#042f2c",
        },
        gold: {
          50: "#fbf9f1",
          100: "#f5f0db",
          200: "#ebdfb7",
          300: "#dec68a",
          400: "#d1ab5e",
          500: "#c4923e",
          600: "#ab7732",
          700: "#89592a",
          800: "#714828",
          900: "#5e3c25",
        }
      },
      fontFamily: {
        arabic: ['"IBM Plex Sans Arabic"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
