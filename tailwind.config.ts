import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "3rem",
      },
      screens: {
        "2xl": "1320px",
      },
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#FAF7F2",
          100: "#F5EFE6",
          200: "#E8D5B5",
          300: "#D9C099",
          400: "#C5A572",
          500: "#B8925A",
          600: "#9A7B4F",
          700: "#7D6340",
          800: "#5F4B31",
          900: "#453622",
        },
        brand: {
          yellow: "hsl(var(--brand-yellow))",
          plum: "hsl(var(--brand-plum))",
        },
        blush: {
          50: "#FAF7F2",
          100: "#F5EFE6",
          200: "#E8D5B5",
          300: "#D9C099",
        },
        gold: {
          DEFAULT: "#C5A572",
          light: "#E8D5B5",
          dark: "#9A7B4F",
        },
        palm: {
          DEFAULT: "#1E3D34",
          light: "#2C5548",
        },
        charcoal: {
          DEFAULT: "#141414",
          soft: "#2A2A2A",
          light: "#5C5C5C",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        admin: ["var(--font-admin)", "IBM Plex Sans", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 7vw, 5.75rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.25rem, 5vw, 4rem)", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
        "display-md": ["clamp(1.75rem, 3.5vw, 2.75rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        luxe: "0 30px 80px -30px rgba(197, 165, 114, 0.35), 0 8px 20px -8px rgba(30, 61, 52, 0.12)",
        soft: "0 8px 30px -8px rgba(20, 20, 20, 0.08)",
        card: "0 1px 2px rgba(20, 20, 20, 0.04), 0 8px 24px -12px rgba(197, 165, 114, 0.2)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "hero-progress": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        "fade-in": "fade-in 0.6s ease-out both",
        shimmer: "shimmer 2.4s linear infinite",
        marquee: "marquee 35s linear infinite",
        "hero-progress": "hero-progress linear forwards",
      },
      backgroundImage: {
        "radial-blush":
          "radial-gradient(ellipse at top, rgba(197, 165, 114, 0.2), transparent 60%)",
        "gradient-luxe":
          "linear-gradient(135deg, #FAF7F2 0%, #ffffff 45%, #E8D5B5 100%)",
        "gradient-brand":
          "linear-gradient(135deg, #1E3D34 0%, #2C5548 50%, #C5A572 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
