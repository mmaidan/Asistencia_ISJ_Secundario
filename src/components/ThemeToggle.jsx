import { useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ className = "" }) {
  const [oscuro, setOscuro] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  function alternar() {
    const nuevo = !oscuro;
    setOscuro(nuevo);
    document.documentElement.classList.toggle("dark", nuevo);
    try {
      localStorage.setItem("ef-tema", nuevo ? "dark" : "light");
    } catch (e) {}
  }

  return (
    <button
      onClick={alternar}
      title={oscuro ? "Modo día" : "Modo noche"}
      className={`w-9 h-9 rounded-full flex items-center justify-center border border-borde text-texto2 bg-transparent cursor-pointer shrink-0 ${className}`}
    >
      {oscuro ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
