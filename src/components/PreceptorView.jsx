import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, XCircle, HelpCircle, ChevronDown, ChevronRight } from "lucide-react";
import { todayISO, formatFecha } from "../lib/data";
import { listarCursos } from "../lib/cursosApi";
import { listarAlumnosPorCurso } from "../lib/alumnosApi";
import { fetchAsistenciaCurso } from "../lib/asistenciasApi";

const ESTADO_META = {
  presente: { label: "Presente", icon: CheckCircle2, colorClass: "text-verde", bgClass: "bg-verde-claro" },
  ausente: { label: "Ausente", icon: XCircle, colorClass: "text-rojo", bgClass: "bg-rojo-claro" },
  tarde: { label: "Tarde", icon: Clock3, colorClass: "text-dorado", bgClass: "bg-dorado-claro" },
};

export default function PreceptorView({ grado }) {
  const [cursos, setCursos] = useState(null);
  const [fecha, setFecha] = useState(todayISO());
  const [error, setError] = useState("");
  const [cursoAbierto, setCursoAbierto] = useState(null);

  useEffect(() => {
    if (!grado) {
      setCursos([]);
      return;
    }
    listarCursos()
      .then((todos) => {
        const delAnio = todos.filter((c) => c.grado === grado);
        setCursos(delAnio);
        setCursoAbierto(delAnio[0]?.id || null);
      })
      .catch(() => setError("No se pudieron cargar los cursos."));
  }, [grado]);

  if (!grado) {
    return (
      <div className="text-center py-16 text-texto2">
        No tenés un año asignado todavía. Pedile al rector o al directivo que te lo asigne desde la
        pestaña "Usuarios".
      </div>
    );
  }

  if (error) return <div className="text-rojo text-sm">{error}</div>;
  if (!cursos) return <div className="text-center py-12 text-texto2">Cargando...</div>;

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
      <div className="font-display text-2xl text-azul leading-tight mb-1">{grado}° año</div>
      <div className="text-sm text-texto2 mb-5 capitalize">{formatFecha(fecha)}</div>

      <div className="grid gap-3">
        {cursos.map((c) => (
          <CursoPlegable
            key={c.id}
            curso={c}
            fecha={fecha}
            abierto={cursoAbierto === c.id}
            onToggle={() => setCursoAbierto(cursoAbierto === c.id ? null : c.id)}
          />
        ))}
      </div>
    </div>
  );
}

function CursoPlegable({ curso, fecha, abierto, onToggle }) {
  const [alumnos, setAlumnos] = useState(null);
  const [reg, setReg] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!abierto || alumnos !== null) return;
    setCargando(true);
    listarAlumnosPorCurso(curso.id).then((a) => {
      setAlumnos(a);
      setCargando(false);
    });
  }, [abierto, curso.id]); // eslint-disable-line

  useEffect(() => {
    if (!abierto) return;
    fetchAsistenciaCurso(curso.id, fecha).then(setReg);
  }, [abierto, curso.id, fecha]);

  const resumen = useMemo(() => {
    if (!reg) return null;
    const valores = Object.values(reg.estados);
    return {
      presentes: valores.filter((e) => e === "presente").length,
      ausentes: valores.filter((e) => e === "ausente").length,
      tarde: valores.filter((e) => e === "tarde").length,
    };
  }, [reg]);

  return (
    <div className="bg-white border border-borde rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 bg-transparent border-none cursor-pointer text-left"
      >
        <span className="font-medium text-tinta">{curso.nombre}</span>
        <span className="flex items-center gap-2 text-sm">
          {reg ? (
            <span className="text-verde bg-verde-claro px-2.5 py-1 rounded-full text-xs font-medium">
              Tomada a las {reg.horaGuardado}
            </span>
          ) : (
            <span className="text-dorado bg-dorado-claro px-2.5 py-1 rounded-full text-xs font-medium">
              Sin registrar
            </span>
          )}
          {abierto ? <ChevronDown size={16} className="text-texto3" /> : <ChevronRight size={16} className="text-texto3" />}
        </span>
      </button>

      {abierto && (
        <div className="border-t border-borde2">
          {resumen && (
            <div className="flex gap-4 px-4 sm:px-5 py-3 text-sm font-mono border-b border-borde2">
              <span className="text-verde font-semibold">{resumen.presentes} presentes</span>
              {resumen.ausentes > 0 && <span className="text-rojo font-semibold">{resumen.ausentes} ausentes</span>}
              {resumen.tarde > 0 && <span className="text-dorado font-semibold">{resumen.tarde} tarde</span>}
            </div>
          )}
          {cargando || !alumnos ? (
            <div className="text-center py-8 text-texto2 text-sm">Cargando alumnos...</div>
          ) : alumnos.length === 0 ? (
            <div className="text-center py-6 text-texto3 text-sm">Sin alumnos cargados.</div>
          ) : (
            <div className="divide-y divide-borde2">
              {alumnos.map((a) => {
                const estado = reg?.estados?.[a.id];
                const meta = estado ? ESTADO_META[estado] : null;
                const Icon = meta?.icon || HelpCircle;
                return (
                  <div key={a.id} className="flex items-center justify-between px-4 sm:px-5 py-2.5">
                    <span className="text-sm text-tinta">
                      {a.apellido}, {a.nombre}
                    </span>
                    <span
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                        meta ? `${meta.colorClass} ${meta.bgClass}` : "text-texto3 bg-tiza"
                      }`}
                    >
                      <Icon size={12} /> {meta ? meta.label : "Sin marcar"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
