import { useEffect, useMemo, useState } from "react";
import { todayISO, formatFecha, nombreCurso } from "../lib/data";
import { listarCursos } from "../lib/cursosApi";
import AsistenciaEditor from "./AsistenciaEditor";

export default function ProfesorView({ grados, genero, userId }) {
  const [cursos, setCursos] = useState(null);
  const [errorCarga, setErrorCarga] = useState("");

  useEffect(() => {
    listarCursos()
      .then(setCursos)
      .catch(() => setErrorCarga("No se pudieron cargar los cursos."));
  }, []);

  if (errorCarga) {
    return <div className="text-center py-16 text-rojo">{errorCarga}</div>;
  }

  if (!cursos) {
    return <div className="text-center py-12 text-texto2">Cargando cursos...</div>;
  }

  return <SelectorYEditor cursos={cursos} grados={grados} genero={genero} userId={userId} />;
}

function SelectorYEditor({ cursos, grados, genero, userId }) {
  const cursosDisponibles = useMemo(
    () =>
      cursos.filter(
        (c) => (!grados || grados.includes(c.grado)) && (!genero || c.genero === genero)
      ),
    [cursos, grados, genero]
  );
  const cursosPorGrado = useMemo(() => {
    const map = {};
    cursosDisponibles.forEach((c) => {
      if (!map[c.grado]) map[c.grado] = [];
      map[c.grado].push(c);
    });
    return map;
  }, [cursosDisponibles]);

  const [cursoId, setCursoId] = useState(cursosDisponibles[0]?.id);
  const [fecha, setFecha] = useState(todayISO());

  if (!cursoId || cursosDisponibles.length === 0) {
    return (
      <div className="text-center py-16 text-texto2">
        No tenés cursos asignados todavía. Pedile al rector que te los asigne.
      </div>
    );
  }

  const curso = cursosDisponibles.find((c) => c.id === cursoId);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div>
          <label className="block text-xs font-medium text-texto2 mb-1.5">Curso</label>
          <select
            value={cursoId}
            onChange={(e) => setCursoId(e.target.value)}
            className="w-full box-border border border-borde rounded-lg px-3 py-2.5 bg-white text-tinta font-medium"
          >
            {Object.entries(cursosPorGrado).map(([grado, lista]) => (
              <optgroup key={grado} label={`${grado}°`}>
                {lista.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.division} — {c.genero} · {c.dia} {c.horario}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-texto2 mb-1.5">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full box-border border border-borde rounded-lg px-3 py-2.5 bg-white text-tinta font-medium"
          />
        </div>
      </div>

      <div className="font-display text-2xl text-azul leading-tight mb-1">
        {nombreCurso(curso)} — {formatFecha(fecha)}
      </div>
      <div className="mb-4" />

      <AsistenciaEditor cursoId={cursoId} fecha={fecha} userId={userId} />
    </div>
  );
}
