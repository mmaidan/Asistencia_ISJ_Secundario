import { useEffect, useState } from "react";
import { CalendarClock, Copy } from "lucide-react";
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
      <div className="flex items-center gap-2 mb-1 text-tinta font-semibold">
        <CalendarClock size={18} /> Día y horario de cada curso
      </div>
      <p className="text-sm text-texto2 mb-4">
        Cada curso puede tener clase una o dos veces por semana. La segunda clase es opcional. Si
        A y B tienen el mismo horario, cargalo en uno y usá "Copiar a B" (o "a A") para no
        repetirlo.
      </p>
      <div className="grid gap-6">
        {Object.entries(porGrado).map(([grado, lista]) => (
          <div key={grado}>
            <div className="font-display text-xl text-azul mb-2 tracking-wide">{grado}° año</div>
            <div className="grid gap-2">
              {lista.map((c) => (
                <FilaCurso
                  key={c.id}
                  curso={c}
                  pareja={cursos.find(
                    (o) => o.grado === c.grado && o.genero === c.genero && o.division !== c.division
                  )}
                  onGuardado={recargar}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SIN_SEGUNDA = "";

function FilaCurso({ curso, pareja, onGuardado }) {
  const [dia, setDia] = useState(curso.dia);
  const [horario, setHorario] = useState(curso.horario);
  const [dia2, setDia2] = useState(curso.dia2 || SIN_SEGUNDA);
  const [horario2, setHorario2] = useState(curso.horario2 || "");
  const [guardando, setGuardando] = useState(false);

  const cambio =
    dia !== curso.dia ||
    horario !== curso.horario ||
    dia2 !== (curso.dia2 || SIN_SEGUNDA) ||
    horario2 !== (curso.horario2 || "");

  async function guardar() {
    setGuardando(true);
    try {
      await actualizarHorarioCurso(curso.id, {
        dia,
        horario,
        dia2: dia2 === SIN_SEGUNDA ? null : dia2,
        horario2: dia2 === SIN_SEGUNDA ? null : horario2,
      });
      onGuardado();
    } catch (e) {
      // silencioso: si falla, el botón "Guardar" simplemente sigue visible
    }
    setGuardando(false);
  }

  async function copiarAPareja() {
    if (!pareja) return;
    setGuardando(true);
    try {
      const datos = {
        dia,
        horario,
        dia2: dia2 === SIN_SEGUNDA ? null : dia2,
        horario2: dia2 === SIN_SEGUNDA ? null : horario2,
      };
      // Si había cambios sin guardar en este curso, los guardamos también,
      // así las dos divisiones quedan exactamente iguales.
      await Promise.all([actualizarHorarioCurso(curso.id, datos), actualizarHorarioCurso(pareja.id, datos)]);
      onGuardado();
    } catch (e) {
      // silencioso
    }
    setGuardando(false);
  }

  return (
    <div className="bg-white border border-borde rounded-xl px-3 sm:px-4 py-3">
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="font-medium text-tinta">{curso.nombre}</div>
        {pareja && (
          <button
            onClick={copiarAPareja}
            disabled={guardando}
            title={`Copiar este horario a la división ${pareja.division}`}
            className="flex items-center gap-1 text-xs font-medium text-azul bg-azul-claro px-2.5 py-1 rounded-full border-none cursor-pointer"
          >
            <Copy size={12} /> Copiar a {pareja.division}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className="text-xs text-texto3 w-full sm:w-20 sm:shrink-0">1ª clase</span>
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
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-texto3 w-full sm:w-20 sm:shrink-0">2ª clase</span>
        <select
          value={dia2}
          onChange={(e) => setDia2(e.target.value)}
          className="border border-borde rounded-lg px-2.5 py-1.5 text-sm text-tinta"
        >
          <option value={SIN_SEGUNDA}>Sin segunda clase</option>
          {DIAS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <input
          value={horario2}
          onChange={(e) => setHorario2(e.target.value)}
          placeholder="14:00 a 15:20"
          disabled={dia2 === SIN_SEGUNDA}
          className="border border-borde rounded-lg px-2.5 py-1.5 text-sm text-tinta flex-1 min-w-[140px] disabled:opacity-50 disabled:bg-tiza"
        />
        {cambio && (
          <button
            onClick={guardar}
            disabled={guardando}
            className="text-xs font-medium text-white bg-verde px-3 py-1.5 rounded-full border-none cursor-pointer ml-auto"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        )}
      </div>
    </div>
  );
}
