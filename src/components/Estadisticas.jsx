import { useEffect, useMemo, useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { CURSOS } from "../lib/data";
import { fetchTodasLasAsistencias } from "../lib/asistenciasApi";

export default function Estadisticas() {
  const [filas, setFilas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetchTodasLasAsistencias().then((data) => {
      setFilas(data);
      setCargando(false);
    });
  }, []);

  const stats = useMemo(() => {
    return CURSOS.map((c) => {
      const filasCurso = filas.filter((f) => f.curso_id === c.id);
      const clases = new Set(filasCurso.map((f) => f.fecha)).size;
      let presentes = 0;
      let ausentes = 0;
      filasCurso.forEach((f) => {
        if (f.estado === "presente") presentes++;
        if (f.estado === "ausente") ausentes++;
      });
      const pct = filasCurso.length ? Math.round((presentes / filasCurso.length) * 100) : null;
      return { curso: c, clases, pct, ausentes };
    });
  }, [filas]);

  if (cargando) {
    return <div className="text-center py-12 text-texto2">Cargando estadísticas...</div>;
  }

  const conDatos = stats.filter((s) => s.clases > 0);

  if (conDatos.length === 0) {
    return (
      <div className="text-center py-16 text-texto2">
        <BarChart3 className="mx-auto mb-3 text-texto3" size={32} />
        Todavía no hay clases registradas para calcular estadísticas.
      </div>
    );
  }

  const peor = [...conDatos].sort((a, b) => a.pct - b.pct)[0];

  return (
    <div>
      <div className="bg-rojo-claro rounded-2xl px-5 py-4 mb-5 flex items-center gap-3">
        <TrendingUp className="text-rojo" size={22} />
        <div>
          <div className="text-sm text-texto2">Curso con más ausentismo</div>
          <div className="font-semibold text-tinta">
            {peor.curso.nombre} — {100 - peor.pct}% de inasistencia
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        {stats.map((s) => (
          <div key={s.curso.id} className="bg-white border border-borde rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-tinta">{s.curso.nombre}</span>
              <span className="text-xs text-texto2">{s.clases} clases registradas</span>
            </div>
            {s.pct === null ? (
              <div className="text-sm text-texto3">Sin datos todavía</div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-borde2 overflow-hidden">
                  <div className="h-full rounded-full bg-verde" style={{ width: `${s.pct}%` }} />
                </div>
                <span className="font-mono text-sm font-semibold text-tinta w-12 text-right">{s.pct}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
