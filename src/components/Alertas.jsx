import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bell } from "lucide-react";
import { ALUMNOS, CURSOS } from "../lib/data";
import { fetchTodasLasAsistencias } from "../lib/asistenciasApi";

export default function Alertas() {
  const [filas, setFilas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetchTodasLasAsistencias().then((data) => {
      setFilas(data);
      setCargando(false);
    });
  }, []);

  const alertas = useMemo(() => {
    const conteo = {};
    filas.forEach((f) => {
      if (f.estado === "ausente") {
        conteo[f.alumno_id] = (conteo[f.alumno_id] || 0) + 1;
      }
    });
    return Object.entries(conteo)
      .filter(([, n]) => n >= 3)
      .map(([alumnoId, n]) => {
        const alumno = ALUMNOS.find((a) => a.id === alumnoId);
        const curso = CURSOS.find((c) => c.id === alumno?.cursoId);
        return { alumno, curso, n };
      })
      .filter((a) => a.alumno)
      .sort((a, b) => b.n - a.n);
  }, [filas]);

  if (cargando) {
    return <div className="text-center py-12 text-texto2">Cargando alertas...</div>;
  }

  if (alertas.length === 0) {
    return (
      <div className="text-center py-16 text-texto2">
        <Bell className="mx-auto mb-3 text-texto3" size={32} />
        No hay alumnos con 3 o más ausencias registradas todavía.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {alertas.map(({ alumno, curso, n }) => (
        <div key={alumno.id} className="flex items-center justify-between bg-white border border-rojo-claro rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-rojo-claro text-rojo flex items-center justify-center shrink-0">
              <AlertTriangle size={17} />
            </div>
            <div>
              <div className="font-semibold text-tinta">{alumno.nombre}</div>
              <div className="text-xs text-texto2">{curso.nombre}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-lg font-bold text-rojo leading-none">{n}</div>
            <div className="text-[11px] text-texto2">ausencias</div>
          </div>
        </div>
      ))}
    </div>
  );
}
