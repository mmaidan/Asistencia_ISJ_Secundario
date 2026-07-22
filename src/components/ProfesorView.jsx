import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { todayISO, formatFecha, nombreCurso } from "../lib/data";
import { listarCursos } from "../lib/cursosApi";
import { listarAlumnosPorCurso } from "../lib/alumnosApi";
import { fetchAsistenciaCurso, guardarAsistencia } from "../lib/asistenciasApi";
import { StatChip, EstadoBtn } from "./AttendanceUI";

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

  return <TomaDeAsistencia cursos={cursos} grados={grados} genero={genero} userId={userId} />;
}

function TomaDeAsistencia({ cursos, grados, genero, userId }) {
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
  const [alumnos, setAlumnos] = useState([]);
  const [cargandoClase, setCargandoClase] = useState(true);
  const [estados, setEstados] = useState({});
  const [horaGuardado, setHoraGuardado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const guardado = horaGuardado !== null && Object.keys(estados).length === alumnos.length;

  useEffect(() => {
    if (!cursoId) return;
    let activo = true;
    setCargandoClase(true);
    Promise.all([listarAlumnosPorCurso(cursoId), fetchAsistenciaCurso(cursoId, fecha)]).then(
      ([listaAlumnos, reg]) => {
        if (!activo) return;
        setAlumnos(listaAlumnos);
        setEstados(reg?.estados || {});
        setHoraGuardado(reg?.horaGuardado || null);
        setCargandoClase(false);
      }
    );
    return () => {
      activo = false;
    };
  }, [cursoId, fecha]);

  if (!cursoId || cursosDisponibles.length === 0) {
    return (
      <div className="text-center py-16 text-texto2">
        No tenés cursos asignados todavía. Pedile al rector que te los asigne.
      </div>
    );
  }

  function setEstado(alumnoId, estado) {
    setEstados((prev) => ({ ...prev, [alumnoId]: estado }));
    setHoraGuardado(null);
  }

  function marcarTodosPresentes() {
    const next = {};
    alumnos.forEach((a) => (next[a.id] = "presente"));
    setEstados(next);
    setHoraGuardado(null);
  }

  async function guardar() {
    setGuardando(true);
    setError("");
    try {
      const hora = await guardarAsistencia(cursoId, fecha, estados, userId);
      setHoraGuardado(hora);
    } catch (e) {
      setError("No se pudo guardar. Revisá tu conexión y probá de nuevo.");
    }
    setGuardando(false);
  }

  const curso = cursosDisponibles.find((c) => c.id === cursoId);
  const presentes = Object.values(estados).filter((e) => e === "presente").length;
  const ausentes = Object.values(estados).filter((e) => e === "ausente").length;
  const tarde = Object.values(estados).filter((e) => e === "tarde").length;
  const faltanMarcar = alumnos.length - Object.keys(estados).length;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-6">
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

      {cargandoClase ? (
        <div className="text-center py-12 text-texto2">Cargando clase...</div>
      ) : alumnos.length === 0 ? (
        <div className="text-center py-12 text-texto2">
          Este curso todavía no tiene alumnos cargados. Pedile al rector que los importe desde la
          pestaña "Alumnos".
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div>
              <div className="font-display text-2xl text-azul leading-tight">
                {nombreCurso(curso)} — {formatFecha(fecha)}
              </div>
              {guardado ? (
                <div className="text-sm text-verde mt-1">Asistencia guardada a las {horaGuardado}</div>
              ) : (
                <div className="text-sm text-dorado mt-1">Todavía no guardaste esta clase</div>
              )}
            </div>
            <button
              onClick={marcarTodosPresentes}
              className="text-sm text-azul font-medium bg-transparent border-none cursor-pointer p-0"
            >
              Marcar todos presentes
            </button>
          </div>

          <div className="flex gap-2 mb-4 font-mono">
            <StatChip label="Presentes" value={presentes} colorClass="text-verde" bgClass="bg-verde-claro" />
            <StatChip label="Ausentes" value={ausentes} colorClass="text-rojo" bgClass="bg-rojo-claro" />
            <StatChip label="Tarde" value={tarde} colorClass="text-dorado" bgClass="bg-dorado-claro" />
          </div>

          <div className="bg-white border border-borde rounded-2xl divide-y divide-borde2 overflow-hidden mb-5">
            {alumnos.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-tinta font-medium">
                  {a.apellido}, {a.nombre}
                </span>
                <div className="flex gap-1.5">
                  <EstadoBtn active={estados[a.id] === "presente"} onClick={() => setEstado(a.id, "presente")} colorClass="text-verde" bgClass="bg-verde-claro" borderClass="border-verde" icon={CheckCircle2} label="Presente" />
                  <EstadoBtn active={estados[a.id] === "tarde"} onClick={() => setEstado(a.id, "tarde")} colorClass="text-dorado" bgClass="bg-dorado-claro" borderClass="border-dorado" icon={Clock3} label="Tarde" />
                  <EstadoBtn active={estados[a.id] === "ausente"} onClick={() => setEstado(a.id, "ausente")} colorClass="text-rojo" bgClass="bg-rojo-claro" borderClass="border-rojo" icon={XCircle} label="Ausente" />
                </div>
              </div>
            ))}
          </div>

          {error && <div className="text-rojo text-sm mb-3">{error}</div>}

          <button
            onClick={guardar}
            disabled={faltanMarcar > 0 || guardando}
            className={`w-full text-white font-semibold py-3.5 rounded-xl border-none text-[15px] ${
              faltanMarcar > 0 || guardando ? "bg-texto3 cursor-not-allowed opacity-70" : "bg-bordo cursor-pointer"
            }`}
          >
            {guardando
              ? "Guardando..."
              : faltanMarcar > 0
              ? `Faltan marcar ${faltanMarcar} alumnos`
              : guardado
              ? "Actualizar asistencia"
              : "Guardar asistencia"}
          </button>
        </>
      )}
    </div>
  );
}
