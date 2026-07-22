import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { DIAS } from "../lib/data";
import { listarCursos, actualizarHorarioCurso } from "../lib/cursosApi";

export default function GestionCursos() {
  const [cursos, setCursos] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    recargar();
  }, []);

  function recargar() {
    listarCursos()
      .then(setCursos)
      .catch(() => setError("No se pudieron cargar los cursos."));
  }

  if (error) return <div className="text-rojo text-sm">{error}</div>;
  if (!cursos) return <div className="text-center py-12 text-texto2">Cargando cursos...</div>;

  const porGrado = {};
  cursos.forEach((c) => {
    if (!porGrado[c.grado]) porGrado[c.grado] = [];
    porGrado[c.grado].push(c);
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-tinta font-semibold">
        <CalendarClock size={18} /> Día y horario de cada curso
      </div>
      <div className="grid gap-6">
        {Object.entries(porGrado).map(([grado, lista]) => (
          <div key={grado}>
            <div className="font-display text-xl text-azul mb-2 tracking-wide">{grado}° año</div>
            <div className="grid gap-2">
              {lista.map((c) => (
                <FilaCurso key={c.id} curso={c} onGuardado={recargar} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilaCurso({ curso, onGuardado }) {
  const [dia, setDia] = useState(curso.dia);
  const [horario, setHorario] = useState(curso.horario);
  const [guardando, setGuardando] = useState(false);

  const cambio = dia !== curso.dia || horario !== curso.horario;

  async function guardar() {
    setGuardando(true);
    try {
      await actualizarHorarioCurso(curso.id, { dia, horario });
      onGuardado();
    } catch (e) {
      // silencioso: si falla, el botón "Guardar" simplemente sigue visible
    }
    setGuardando(false);
  }

  return (
    <div className="bg-white border border-borde rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
      <div className="font-medium text-tinta w-40 shrink-0">{curso.nombre}</div>
      <select
        value={dia}
        onChange={(e) => setDia(e.target.value)}
        className="border border-borde rounded-lg px-2.5 py-1.5 text-sm text-tinta"
      >
        {DIAS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <input
        value={horario}
        onChange={(e) => setHorario(e.target.value)}
        placeholder="14:00 a 15:20"
        className="border border-borde rounded-lg px-2.5 py-1.5 text-sm text-tinta flex-1 min-w-[140px]"
      />
      {cambio && (
        <button
          onClick={guardar}
          disabled={guardando}
          className="text-xs font-medium text-white bg-verde px-3 py-1.5 rounded-full border-none cursor-pointer"
        >
          {guardando ? "Guardando..." : "Guardar"}
        </button>
      )}
    </div>
  );
}
