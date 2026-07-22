/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        azul: "#5B7C9D",
        "azul-claro": "#E4EBF3",
        bordo: "#7A2333",
        "bordo-hover": "#6A1E2B",
        rojo: "#B85C56",
        "rojo-claro": "#F5DEDC",
        dorado: "#B98A3E",
        "dorado-claro": "#F6EAD3",
        verde: "#5F8F55",
        "verde-claro": "#E6EFE1",
        tinta: "#2B2B28",
        texto2: "#6B6860",
        texto3: "#B0ADA4",
        borde: "#E6E2D8",
        borde2: "#F0ECE1",
        tiza: "#FAF8F4",
      },
      fontFamily: {
        display: ['"Bebas Neue"', "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
