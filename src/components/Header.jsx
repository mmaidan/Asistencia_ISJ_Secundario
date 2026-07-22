import { ArrowLeft, ClipboardList, Dumbbell, School } from "lucide-react";
import { LOGO_B64 } from "../lib/logo";

const ROL_META = {
  profesor: { nombre: "Profesor de Educación Física", icon: Dumbbell },
  preceptor: { nombre: "Preceptor", icon: ClipboardList },
  rector: { nombre: "Rector", icon: School },
};

export default function Header({ rol, nombre, onSalir }) {
  const meta = ROL_META[rol] || ROL_META.profesor;
  const Icon = meta.icon;

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <img src={LOGO_B64} alt="Escudo del Instituto San José" className="w-8 h-auto" />
        <div className="inline-flex items-center gap-2 bg-azul-claro text-azul px-3.5 py-1.5 rounded-full text-sm font-medium">
          <Icon size={16} />
          {nombre}
        </div>
      </div>
      <button
        onClick={onSalir}
        className="flex items-center gap-1.5 text-sm text-texto2 hover:text-tinta transition-colors bg-transparent border-none cursor-pointer p-0"
      >
        <ArrowLeft size={16} /> Cerrar sesión
      </button>
    </div>
  );
}
