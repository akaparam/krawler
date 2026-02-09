import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f8fafc",
          100: "#eef2f6",
          200: "#dce4eb",
          300: "#bbc8d6",
          400: "#8ca0b5",
          500: "#627d95",
          600: "#486178",
          700: "#34495d",
          800: "#213544",
          900: "#121f2a"
        },
        sky: {
          100: "#e8fbff",
          200: "#bef4ff",
          300: "#82eaff",
          400: "#3dd9ff",
          500: "#09bee8",
          600: "#058fb2"
        },
        amber: {
          100: "#fff8e7",
          200: "#ffecb3",
          300: "#fcd67d",
          400: "#f5bc42",
          500: "#db9a10",
          600: "#a97108"
        }
      },
      boxShadow: {
        soft: "0 16px 40px -20px rgba(20, 40, 60, 0.35)"
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      fontFamily: {
        sans: ["Space Grotesk", "Segoe UI", "Helvetica", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"]
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        glow: {
          "0%,100%": { boxShadow: "0 0 0 rgba(9,190,232,0)" },
          "50%": { boxShadow: "0 0 24px rgba(9,190,232,0.25)" }
        }
      },
      animation: {
        "fade-up": "fade-up 320ms ease-out",
        glow: "glow 2.5s ease-in-out infinite"
      }
    }
  },
  plugins: []
} satisfies Config;
