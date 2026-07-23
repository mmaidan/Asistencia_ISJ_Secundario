import { ArrowLeft, ClipboardList, Dumbbell, School, ShieldCheck, KeyRound } from "lucide-react";
import { LOGO_B64 } from "../lib/logo";
import ThemeToggle from "./ThemeToggle";

const ROL_META = {
  profesor: { nombre: "Profesor de Educación Física", icon: Dumbbell, label: "Profesor" },
  preceptor: { nombre: "Preceptor", icon: ClipboardList, label: "Preceptor" },
  directivo: { nombre: "Directivo", icon: ShieldCheck, label: "Directivo" },
  rector: { nombre: "Rector", icon: School, label: "Rector" },
};

export default function Header({ rol, nombre, subtitulo, onSalir, onCambiarClave }) {
  const meta = ROL_META[rol] || ROL_META.profesor;
  const Icon = meta.icon;

  return (
    <div className="flex items-center justify-between mb-8 print:hidden gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <img src={LOGO_B64} alt="Escudo del Instituto San José" className="w-8 h-auto shrink-0" />
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 bg-azul-claro text-azul px-3.5 py-1.5 rounded-full text-sm font-medium">
            <Icon size={16} />
            {nombre}
          </div>
          <div className="text-xs text-texto2 mt-1.5 ml-1">
            {meta.label}
            {subtitulo ? ` · ${subtitulo}` : ""}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <ThemeToggle />
        {onCambiarClave && (
          <button
            onClick={onCambiarClave}
            className="flex items-center gap-1.5 text-sm text-texto2 hover:text-tinta transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            <KeyRound size={16} /> <span className="hidden sm:inline">Mi contraseña</span>
          </button>
        )}
        <button
          onClick={onSalir}
          className="flex items-center gap-1.5 text-sm text-texto2 hover:text-tinta transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
