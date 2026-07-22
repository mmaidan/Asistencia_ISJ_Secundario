import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, XCircle, HelpCircle } from "lucide-react";
import { todayISO, formatFecha, nombreCurso } from "../lib/data";
import { listarCursos } from "../lib/cursosApi";
import { listarAlumnosPorCurso } from "../lib/alumnosApi";
import { fetchAsistenciaCurso } from "../lib/asistenciasApi";

const ESTADO_META = {
  presente: { label: "Presente", icon: CheckCircle2, colorClass: "text-verde", bgClass: "bg-verde-claro" },
  ausente: { label: "Ausente", icon: XCircle, colorClass: "text-rojo", bgClass: "bg-rojo-claro" },
  tarde: { label: "Tarde", icon: Clock3, colorClass: "text-dorado", bgClass: "bg-dorado-claro" },
};

export default function PreceptorView({ cursoId }) {
  const [curso, setCurso] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [fecha, setFecha] = useState(todayISO());
  const [reg, setReg] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!cursoId) {
      setCargando(false);
      return;
    }
    Promise.all([listarCursos(), listarAlumnosPorCurso(cursoId)])
      .then(([cursos, listaAlumnos]) => {
        setCurso(cursos.find((c) => c.id === cursoId) || null);
        setAlumnos(listaAlumnos);
      })
      .catch(() => setError("No se pudieron cargar los datos del curso."));
  }, [cursoId]);

  useEffect(() => {
    if (!cursoId) return;
    let activo = true;
    setCargando(true);
    fetchAsistenciaCurso(cursoId, fecha).then((r) => {
      if (!activo) return;
      setReg(r);
      setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, [cursoId, fecha]);

  const resumen = useMemo(() => {
    if (!reg) return null;
    const valores = Object.values(reg.estados);
    return {
      presentes: valores.filter((e) => e === "presente").length,
      ausentes: valores.filter((e) => e === "ausente").length,
      tarde: valores.filter((e) => e === "tarde").length,
    };
  }, [reg]);

  if (!cursoId) {
    return (
      <div className="text-center py-16 text-texto2">
        No tenés un curso asignado todavía. Pedile al rector o al directivo que te lo asigne desde
        la pestaña "Usuarios".
      </div>
    );
  }

  if (error) return <div className="text-rojo text-sm">{error}</div>;

  return (
    <div>
      <div className="mb-4">
        <label className="block text-xs font-medium text-texto2 mb-1.5">Fecha</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border border-borde rounded-lg px-3 py-2.5 bg-white text-tinta font-medium"
        />
      </div>

      {curso && (
        <div className="font-display text-2xl text-azul leading-tight mb-1">{nombreCurso(curso)}</div>
      )}
      <div className="text-sm text-texto2 mb-4 capitalize">{formatFecha(fecha)}</div>

      {cargando ? (
        <div className="text-center py-12 text-texto2">Cargando...</div>
      ) : !reg ? (
        <div className="bg-dorado-claro text-dorado rounded-xl px-4 py-3 text-sm font-medium mb-5">
          El profesor todavía no cargó la asistencia de este día.
        </div>
      ) : (
        <div className="flex gap-4 mb-4 text-sm font-mono">
          <span className="text-verde font-semibold">{resumen.presentes} presentes</span>
          {resumen.ausentes > 0 && <span className="text-rojo font-semibold">{resumen.ausentes} ausentes</span>}
          {resumen.tarde > 0 && <span className="text-dorado font-semibold">{resumen.tarde} tarde</span>}
        </div>
      )}

      {!cargando && alumnos.length === 0 ? (
        <div className="text-center py-12 text-texto2">Este curso todavía no tiene alumnos cargados.</div>
      ) : (
        <div className="bg-white border border-borde rounded-2xl divide-y divide-borde2 overflow-hidden">
          {alumnos.map((a) => {
            const estado = reg?.estados?.[a.id];
            const meta = estado ? ESTADO_META[estado] : null;
            const Icon = meta?.icon || HelpCircle;
            return (
              <div key={a.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-tinta font-medium">
                  {a.apellido}, {a.nombre}
                </span>
                <span
                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                    meta ? `${meta.colorClass} ${meta.bgClass}` : "text-texto3 bg-tiza"
                  }`}
                >
                  <Icon size={13} /> {meta ? meta.label : "Sin marcar"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
