/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Outfit", "system-ui", "sans-serif"],
        body: ["Manrope", "system-ui", "sans-serif"],
      },
      colors: {
        bg: "#F8F9F7",
        surface: "#FFFFFF",
        ink: "#0F1A14",
        muted: "#5C6B61",
        line: "#E2E5DF",
        forest: {
          DEFAULT: "#1A4331",
          hover: "#2B5A44",
          deep: "#0F2C20",
        },
        sage: "#D8E2DC",
        earth: "#E07A5F",
        mp: "#009EE3",
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
