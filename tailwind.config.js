import tailwindAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/sections/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        /* Canvas / charcoal surfaces from src/index.css. color-mix keeps the
           opacity modifier working (bg-container/90, bg-global/80). */
        global: "color-mix(in srgb, var(--bg-global) calc(<alpha-value> * 100%), transparent)",
        container: "color-mix(in srgb, var(--bg-container) calc(<alpha-value> * 100%), transparent)",
        "state-hover": "color-mix(in srgb, var(--state-hover) calc(<alpha-value> * 100%), transparent)",
        "media-blank": "color-mix(in srgb, var(--media-blank) calc(<alpha-value> * 100%), transparent)",
        "accent-sage": "color-mix(in srgb, var(--accent-sage) calc(<alpha-value> * 100%), transparent)",
        "accent-slate": "color-mix(in srgb, var(--accent-slate) calc(<alpha-value> * 100%), transparent)",
        ink: "color-mix(in srgb, var(--text-primary) calc(<alpha-value> * 100%), transparent)",
        beunec: {
          /* Legacy beunec-* utilities resolve to the same tokens as everything else */
          blue: "color-mix(in srgb, var(--accent-sage) calc(<alpha-value> * 100%), transparent)",
          "blue-light": "color-mix(in srgb, var(--accent-slate) calc(<alpha-value> * 100%), transparent)",
          "blue-dark": "#5a685d",
          calm: "color-mix(in srgb, var(--bg-global) calc(<alpha-value> * 100%), transparent)",
          "calm-dark": "#111111",
          sage: "color-mix(in srgb, var(--accent-sage) calc(<alpha-value> * 100%), transparent)",
          slate: "color-mix(in srgb, var(--accent-slate) calc(<alpha-value> * 100%), transparent)",
        },
        baap: {
          global: "var(--bg-global)",
          container: "var(--bg-container)",
          hover: "var(--state-hover)",
          media: "var(--media-blank)",
          text: "var(--text-primary)",
          sage: "var(--accent-sage)",
          slate: "var(--accent-slate)",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        calm: "0 4px 20px -2px rgb(17 17 17 / 0.08)",
        "calm-lg": "0 10px 40px -4px rgb(17 17 17 / 0.14)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [tailwindAnimate],
}
