/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'neon-emerald': '0 0 10px rgba(16, 185, 129, 0.2), 0 0 20px rgba(16, 185, 129, 0.1)',
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.5), 0 0 30px rgba(6, 182, 212, 0.2)',
        'neon-amber': '0 0 15px rgba(245, 158, 11, 0.4), 0 0 30px rgba(245, 158, 11, 0.1)',
      }
    },
  },
  plugins: [],
}
