/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  mode: "jit",
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        "black-100": "#2B2C35",
        "primary-blue": {
          DEFAULT: "#2B59FF",
          100: "#F5F8FF",
          200: "#D6E4FF",
          300: "#AABFFF",
        },
        "secondary-orange": "#f79761",
        "light-white": {
          DEFAULT: "rgba(59,60,152,0.03)",
          100: "rgba(59,60,152,0.02)",
        },
        grey: "#747A88",
        midnight: "#0B0A10",
        destructive: "red",
        muted: {
          DEFAULT: "#F2F1F9",
          foreground: "#72717C",
        },
      },
      keyframes: {
        overlayShow: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        contentShow: {
          from: {
            opacity: "0",
            transform: "translate(-50%, -48%) scale(0.96)",
          },
          to: {
            opacity: "1",
            transform: "translate(-50%, -50%) scale(1)",
          },
        },
      },
      animation: {
        overlayShow:
          "overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        contentShow:
          "contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      },

      backgroundImage: {
        pattern: "url('/pattern.png')",
        "hero-bg": "url('/hero-bg.png')",
      },
      titleColor: {
        DEFAULT: "#7fceff",
      },
    },
  },
  plugins: ["@tailwind-merge"],
};
