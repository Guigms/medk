/** @type {import('tailwindcss').Config} */
module.exports = {
  // 🌟 OBRIGATÓRIO: Avisa o compilador para gerar as classes dark baseadas no HTML
  darkMode: 'class', 
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        medk: {
          blue: "#253289",
          cyan: "#10BCEC",
          green: "#25D366",
        }
      },
    },
  },
  plugins: [],
};