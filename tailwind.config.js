/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Todos los colores están atados a variables CSS (definidas en
        // src/index.css) para que el modo día/noche funcione sin tener
        // que tocar las clases de cada componente.
        azul: "var(--color-azul)",
        "azul-claro": "var(--color-azul-claro)",
        bordo: "var(--color-bordo)",
        "bordo-hover": "var(--color-bordo-hover)",
        rojo: "var(--color-rojo)",
        "rojo-claro": "var(--color-rojo-claro)",
        dorado: "var(--color-dorado)",
        "dorado-claro": "var(--color-dorado-claro)",
        verde: "var(--color-verde)",
        "verde-claro": "var(--color-verde-claro)",
        tinta: "var(--color-tinta)",
        texto2: "var(--color-texto2)",
        texto3: "var(--color-texto3)",
        borde: "var(--color-borde)",
        borde2: "var(--color-borde2)",
        tiza: "var(--color-tiza)",
        white: "var(--color-card)",
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
