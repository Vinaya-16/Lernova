/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#A855F7",
          dark: "#7E22CE",
        },
        secondary: "#EC4899",
        success: "#22C55E",
        warning: "#F59E0B",
        info: "#3B82F6",
        app: "#F5F3FF",
        surface: "#FFFFFF",
        sidebar: "#FFFFFF",
        "text-primary": "#1F2937",
        "text-secondary": "#6B7280",
        "border-light": "#E5E7EB",
        "active-bg": "#F3E8FF",
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "sans-serif"],
      },
      fontSize: {
        h1: ["32px", { lineHeight: "1.3", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        h3: ["20px", { lineHeight: "1.3", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "1.5", fontWeight: "500" }],
        body: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "1.4", fontWeight: "400" }],
      },
      borderRadius: {
        card: "20px",
        btn: "14px",
        input: "14px",
        sidebar: "12px",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(124, 58, 237, 0.08)",
        card: "0 4px 16px rgba(31, 41, 55, 0.06)",
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(135deg, #A855F7 0%, #EC4899 100%)",
      },
      spacing: {
        sidebar: "280px",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}