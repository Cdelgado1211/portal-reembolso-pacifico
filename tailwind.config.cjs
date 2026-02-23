/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "pacifico-taupe": "var(--pacifico-taupe)",
        "pacifico-taupe-2": "var(--pacifico-taupe-2)",
        "pacifico-beige": "var(--pacifico-beige)",
        "pacifico-gray": "var(--pacifico-gray)",
        "pacifico-navy": "var(--pacifico-navy)",
        "pacifico-orange": "var(--pacifico-orange)",
        "pacifico-orange-2": "var(--pacifico-orange-2)",
        "pacifico-accent": "var(--pacifico-accent)",
        "pacifico-danger": "var(--pacifico-danger)",
        "pacifico-white": "var(--pacifico-white)"
      },
      boxShadow: {
        "pacifico": "0 8px 20px rgba(3, 4, 28, 0.08)",
        "pacifico-soft": "0 6px 14px rgba(3, 4, 28, 0.06)"
      },
      borderRadius: {
        "pacifico": "16px"
      }
    }
  },
  plugins: []
};
