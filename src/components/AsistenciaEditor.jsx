import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, XCircle, FileText } from "lucide-react";
import { formatHorariosCurso } from "../lib/data";
import { listarAlumnosPorCurso } from "../lib/alumnosApi";
import { fetchAsistenciaCurso, guardarAsistencia } from "../lib/asistenciasApi";
import { fetchJustificativosClase, guardarJustificativo, borrarJustificativo } from "../lib/justificativosApi";
import { StatChip, EstadoBtn } from "./AttendanceUI";

// Recibe uno o varios cursos (por ejemplo, división A y división B del
// mismo año) y los muestra como una sola sesión de asistencia, agrupada
// por división para que se distingan, pero con un solo botón de guardar.
export default function AsistenciaEditor({ cursos, fecha, userId }) {
  const [alumnosPorCurso, setAlumnosPorCurso] = useState(null);
  const [regsPorCurso, setRegsPorCurso] = useState({});
  const [cargando, setCargando] = useState(true);
  const [estados, setEstados] = useState({});
  const [justificativos, setJustificativos] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cursoIds = useMemo(() => cursos.map((c) => c.id).join(","), [cursos]);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    Promise.all(
      cursos.map((c) =>
        Promise.all([
          listarAlumnosPorCurso(c.id),
          fetchAsistenciaCurso(c.id, fecha),
          fetchJustificativosClase(c.id, fecha),
        ])
      )
    ).then((resultados) => {
      if (!activo) return;
      const porCurso = {};
      const regs = {};
      const estadosCombinados = {};
      const justifCombinados = {};
      resultados.forEach(([listaAlumnos, reg, justif], i) => {
        const curso = cursos[i];
        porCurso[curso.id] = listaAlumnos;
        regs[curso.id] = reg;
        if (reg) Object.assign(estadosCombinados, reg.estados);
        Object.assign(justifCombinados, justif);
      });
      setAlumnosPorCurso(porCurso);
      setRegsPorCurso(regs);
      setEstados(estadosCombinados);
      setJustificativos(justifCombinados);
      setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, [cursoIds, fecha]); // eslint-disable-line

  const alumnos = useMemo(() => {
    if (!alumnosPorCurso) return [];
    return cursos.flatMap((c) => alumnosPorCurso[c.id] || []);
  }, [alumnosPorCurso, cursos]);

  const faltanMarcar = alumnos.length - Object.keys(estados).length;
  const todoGuardado = cursos.every((c) => regsPorCurso[c.id]) && faltanMarcar === 0;

  function setEstado(alumnoId, estado) {
    setEstados((prev) => ({ ...prev, [alumnoId]: estado }));
  }

  function marcarTodosPresentes() {
    const next = {};
    alumnos.forEach((a) => (next[a.id] = "presente"));
    setEstados(next);
  }

  async function justificar(alumno) {
    const nombreCompleto = `${alumno.apellido}, ${alumno.nombre}`;
    const actual = justificativos[alumno.id] || "";
    const motivo = window.prompt(`Motivo de la falta de ${nombreCompleto}:`, actual);
    if (motivo === null) return; // canceló
    try {
      if (motivo.trim() === "") {
        await borrarJustificativo(alumno.curso_id, fecha, alumno.id);
        setJustificativos((prev) => {
          const next = { ...prev };
          delete next[alumno.id];
          return next;
        });
      } else {
        await guardarJustificativo(alumno.curso_id, fecha, alumno.id, motivo.trim(), userId);
        setJustificativos((prev) => ({ ...prev, [alumno.id]: motivo.trim() }));
      }
    } catch (e) {
      setError("No se pudo guardar el justificativo.");
    }
  }

  async function guardar() {
    setGuardando(true);
    setError("");
    try {
      const nuevosRegs = { ...regsPorCurso };
      for (const curso of cursos) {
        const listaAlumnos = alumnosPorCurso[curso.id] || [];
        const subset = {};
        listaAlumnos.forEach((a) => {
          if (estados[a.id]) subset[a.id] = estados[a.id];
        });
        if (Object.keys(subset).length === 0) continue;
        const hora = await guardarAsistencia(curso.id, fecha, subset, userId);
        nuevosRegs[curso.id] = { horaGuardado: hora, estados: subset };
      }
      setRegsPorCurso(nuevosRegs);
    } catch (e) {
      setError("No se pudo guardar. Revisá tu conexión y probá de nuevo.");
    }
    setGuardando(false);
  }

  const presentes = Object.values(estados).filter((e) => e === "presente").length;
  const ausentes = Object.values(estados).filter((e) => e === "ausente").length;
  const tarde = Object.values(estados).filter((e) => e === "tarde").length;

  if (cargando) {
    return <div className="text-center py-10 text-texto2 text-sm">Cargando clase...</div>;
  }

  if (alumnos.length === 0) {
    return (
      <div className="text-center py-10 text-texto2 text-sm">
        Este curso todavía no tiene alumnos cargados.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        {todoGuardado ? (
          <div className="text-sm text-verde">Asistencia guardada</div>
        ) : (
          <div className="text-sm text-dorado">Todavía no se guardó esta clase</div>
        )}
        <button
          onClick={marcarTodosPresentes}
          className="text-sm text-azul font-medium bg-transparent border-none cursor-pointer p-0"
        >
          Marcar todos presentes
        </button>
      </div>

      <div className="flex gap-2 mb-5 font-mono">
        <StatChip label="Presentes" value={presentes} colorClass="text-verde" bgClass="bg-verde-claro" />
        <StatChip label="Ausentes" value={ausentes} colorClass="text-rojo" bgClass="bg-rojo-claro" />
        <StatChip label="Tarde" value={tarde} colorClass="text-dorado" bgClass="bg-dorado-claro" />
      </div>

      {cursos.map((curso) => {
        const listaAlumnos = (alumnosPorCurso[curso.id] || []).slice().sort((a, b) => a.apellido.localeCompare(b.apellido));
        const reg = regsPorCurso[curso.id];
        if (listaAlumnos.length === 0) return null;
        return (
          <div key={curso.id} className="mb-5">
            <div className="flex items-center justify-between mb-2 px-1 gap-2 flex-wrap">
              <div>
                <div className="text-sm font-semibold text-tinta">
                  División {curso.division}
                  {cursos.length > 2 || cursos.some((c) => c.genero !== cursos[0].genero)
                    ? ` — ${curso.genero}`
                    : ""}
                </div>
                <div className="text-xs text-texto3">{formatHorariosCurso(curso)}</div>
              </div>
              {reg ? (
                <span className="text-xs text-verde bg-verde-claro px-2 py-0.5 rounded-full font-medium">
                  Tomada a las {reg.horaGuardado}
                </span>
              ) : (
                <span className="text-xs text-dorado bg-dorado-claro px-2 py-0.5 rounded-full font-medium">
                  Sin guardar
                </span>
              )}
            </div>
            <div className="bg-white border border-borde rounded-2xl divide-y divide-borde2 overflow-hidden">
              {listaAlumnos.map((a) => {
                const nombreCompleto = `${a.apellido}, ${a.nombre}`;
                const tieneJustificativo = Boolean(justificativos[a.id]);
                return (
                  <div key={a.id} className="flex items-center justify-between gap-2 px-3 sm:px-4 py-3">
                    <div className="min-w-0">
                      <span className="text-tinta font-medium text-sm sm:text-base block truncate">
                        {nombreCompleto}
                      </span>
                      {estados[a.id] === "ausente" && tieneJustificativo && (
                        <span className="text-xs text-azul truncate block" title={justificativos[a.id]}>
                          Justificada: {justificativos[a.id]}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 shrink-0 items-center">
                      {estados[a.id] === "ausente" && (
                        <button
                          onClick={() => justificar(a)}
                          title={tieneJustificativo ? "Editar justificativo" : "Justificar falta"}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center border cursor-pointer ${
                            tieneJustificativo ? "border-azul text-azul bg-azul-claro" : "border-borde text-texto3 bg-transparent"
                          }`}
                        >
                          <FileText size={15} />
                        </button>
                      )}
                      <EstadoBtn active={estados[a.id] === "presente"} onClick={() => setEstado(a.id, "presente")} colorClass="text-verde" bgClass="bg-verde-claro" borderClass="border-verde" icon={CheckCircle2} label="Presente" />
                      <EstadoBtn active={estados[a.id] === "tarde"} onClick={() => setEstado(a.id, "tarde")} colorClass="text-dorado" bgClass="bg-dorado-claro" borderClass="border-dorado" icon={Clock3} label="Tarde" />
                      <EstadoBtn active={estados[a.id] === "ausente"} onClick={() => setEstado(a.id, "ausente")} colorClass="text-rojo" bgClass="bg-rojo-claro" borderClass="border-rojo" icon={XCircle} label="Ausente" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

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
          : todoGuardado
          ? "Actualizar asistencia"
          : "Guardar asistencia"}
      </button>
    </div>
  );
}
