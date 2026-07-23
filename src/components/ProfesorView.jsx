import { useEffect, useMemo, useState } from "react";
import { todayISO, formatFecha } from "../lib/data";
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
  // El profe elige el AÑO (no la división puntual): se le trae de una
  // vez a los alumnos de A y B juntos, distinguidos en la vista.
  const cursosDisponibles = useMemo(
    () =>
      cursos.filter(
        (c) => (!grados || grados.includes(c.grado)) && (!genero || c.genero === genero)
      ),
    [cursos, grados, genero]
  );

  const aniosDisponibles = useMemo(() => {
    const set = new Set(cursosDisponibles.map((c) => c.grado));
    return Array.from(set).sort((a, b) => a - b);
  }, [cursosDisponibles]);

  const [grado, setGrado] = useState(aniosDisponibles[0]);
  const [fecha, setFecha] = useState(todayISO());

  if (!grado || aniosDisponibles.length === 0) {
    return (
      <div className="text-center py-16 text-texto2">
        No tenés cursos asignados todavía. Pedile al rector que te los asigne.
      </div>
    );
  }

  const cursosDelAnio = cursosDisponibles.filter((c) => c.grado === grado);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div>
          <label className="block text-xs font-medium text-texto2 mb-1.5">Año</label>
          <select
            value={grado}
            onChange={(e) => setGrado(Number(e.target.value))}
            className="w-full box-border border border-borde rounded-lg px-3 py-2.5 bg-white text-tinta font-medium"
          >
            {aniosDisponibles.map((g) => (
              <option key={g} value={g}>
                {g}° año
              </option>
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
        {grado}° año — {formatFecha(fecha)}
      </div>
      <div className="mb-4" />

      <AsistenciaEditor cursos={cursosDelAnio} fecha={fecha} userId={userId} />
    </div>
  );
}
