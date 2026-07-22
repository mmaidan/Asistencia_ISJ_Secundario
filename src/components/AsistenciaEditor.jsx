import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, XCircle, FileText } from "lucide-react";
import { listarAlumnosPorCurso } from "../lib/alumnosApi";
import { fetchAsistenciaCurso, guardarAsistencia } from "../lib/asistenciasApi";
import { fetchJustificativosClase, guardarJustificativo, borrarJustificativo } from "../lib/justificativosApi";
import { StatChip, EstadoBtn } from "./AttendanceUI";

export default function AsistenciaEditor({ cursoId, fecha, userId }) {
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [estados, setEstados] = useState({});
  const [justificativos, setJustificativos] = useState({});
  const [horaGuardado, setHoraGuardado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const guardado = horaGuardado !== null && Object.keys(estados).length === alumnos.length;

  useEffect(() => {
    if (!cursoId) return;
    let activo = true;
    setCargando(true);
    Promise.all([
      listarAlumnosPorCurso(cursoId),
      fetchAsistenciaCurso(cursoId, fecha),
      fetchJustificativosClase(cursoId, fecha),
    ]).then(([listaAlumnos, reg, justif]) => {
      if (!activo) return;
      setAlumnos(listaAlumnos);
      setEstados(reg?.estados || {});
      setHoraGuardado(reg?.horaGuardado || null);
      setJustificativos(justif);
      setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, [cursoId, fecha]);

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

  async function justificar(alumnoId, nombreCompleto) {
    const actual = justificativos[alumnoId] || "";
    const motivo = window.prompt(`Motivo de la falta de ${nombreCompleto}:`, actual);
    if (motivo === null) return; // canceló
    try {
      if (motivo.trim() === "") {
        await borrarJustificativo(cursoId, fecha, alumnoId);
        setJustificativos((prev) => {
          const next = { ...prev };
          delete next[alumnoId];
          return next;
        });
      } else {
        await guardarJustificativo(cursoId, fecha, alumnoId, motivo.trim(), userId);
        setJustificativos((prev) => ({ ...prev, [alumnoId]: motivo.trim() }));
      }
    } catch (e) {
      setError("No se pudo guardar el justificativo.");
    }
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

  const presentes = Object.values(estados).filter((e) => e === "presente").length;
  const ausentes = Object.values(estados).filter((e) => e === "ausente").length;
  const tarde = Object.values(estados).filter((e) => e === "tarde").length;
  const faltanMarcar = alumnos.length - Object.keys(estados).length;

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
        {guardado ? (
          <div className="text-sm text-verde">Asistencia guardada a las {horaGuardado}</div>
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

      <div className="flex gap-2 mb-4 font-mono">
        <StatChip label="Presentes" value={presentes} colorClass="text-verde" bgClass="bg-verde-claro" />
        <StatChip label="Ausentes" value={ausentes} colorClass="text-rojo" bgClass="bg-rojo-claro" />
        <StatChip label="Tarde" value={tarde} colorClass="text-dorado" bgClass="bg-dorado-claro" />
      </div>

      <div className="bg-white border border-borde rounded-2xl divide-y divide-borde2 overflow-hidden mb-5">
        {alumnos.map((a) => {
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
                    onClick={() => justificar(a.id, nombreCompleto)}
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
    </div>
  );
}
