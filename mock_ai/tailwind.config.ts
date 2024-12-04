/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-inter)", "sans-serif"],
        subheading: ["var(--font-poppins)", "sans-serif"],
      },
      fontWeight: {
        light: "300",
        regular: "400",
        medium: "500",
        bold: "600",
        extraBold: "700",
      },
      lineHeight: {
        normal: "1.6",
      },
      colors: {
        "black-100": "#2B2C35",
        "primary-blue": {
          "100": "#F5F8FF",
          "200": "#D6E4FF",
          "300": "#AABFFF",
          DEFAULT: "#2B59FF",
        },
        "secondary-orange": "#f79761",
        "light-white": {
          "100": "rgba(59,60,152,0.02)",
          DEFAULT: "rgba(59,60,152,0.03)",
        },
        grey: "#747A88",
        midnight: "#0B0A10",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        label: "#ffffff",
      },
      keyframes: {
        overlayShow: {
          from: {
            opacity: "0",
          },
          to: {
            opacity: "1",
          },
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
      headingColor: {
        DEFAULT: "#7fceff",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: ["@tailwind-merge", "tailwindcss-animate"],
};
