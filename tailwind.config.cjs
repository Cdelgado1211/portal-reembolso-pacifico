/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "atlas-taupe": "var(--atlas-taupe)",
        "atlas-taupe-2": "var(--atlas-taupe-2)",
        "atlas-beige": "var(--atlas-beige)",
        "atlas-gray": "var(--atlas-gray)",
        "atlas-navy": "var(--atlas-navy)",
        "atlas-orange": "var(--atlas-orange)",
        "atlas-orange-2": "var(--atlas-orange-2)",
        "atlas-accent": "var(--atlas-accent)",
        "atlas-danger": "var(--atlas-danger)",
        "atlas-white": "var(--atlas-white)"
      },
      boxShadow: {
        "atlas": "0 8px 20px rgba(3, 4, 28, 0.08)",
        "atlas-soft": "0 6px 14px rgba(3, 4, 28, 0.06)"
      },
      borderRadius: {
        "atlas": "16px"
      }
    }
  },
  plugins: []
};
