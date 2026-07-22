import { useEffect, useMemo, useState } from "react";
import { todayISO, formatFecha } from "../lib/data";
import { listarCursos } from "../lib/cursosApi";
import { listarTodosLosAlumnos } from "../lib/alumnosApi";
import { fetchAsistenciasDelDia } from "../lib/asistenciasApi";
import { CursoEstadoCard } from "./AttendanceUI";

export default function EstadoDelDia() {
  const [fecha, setFecha] = useState(todayISO());
  const [cursos, setCursos] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [porCurso, setPorCurso] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([listarCursos(), listarTodosLosAlumnos()]).then(([c, a]) => {
      setCursos(c);
      setAlumnos(a);
    });
  }, []);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    fetchAsistenciasDelDia(fecha).then((data) => {
      if (!activo) return;
      setPorCurso(data);
      setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, [fecha]);

  const totalPorCurso = useMemo(() => {
    const map = {};
    alumnos.forEach((a) => {
      map[a.curso_id] = (map[a.curso_id] || 0) + 1;
    });
    return map;
  }, [alumnos]);

  const porGrado = useMemo(() => {
    if (!cursos) return {};
    const map = {};
    cursos.forEach((c) => {
      if (!map[c.grado]) map[c.grado] = [];
      map[c.grado].push({ curso: c, reg: porCurso[c.id] || null, total: totalPorCurso[c.id] || 0 });
    });
    return map;
  }, [cursos, porCurso, totalPorCurso]);

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
      <div className="text-sm text-texto2 mb-4 capitalize">{formatFecha(fecha)}</div>

      {!cursos || cargando ? (
        <div className="text-center py-12 text-texto2">Cargando...</div>
      ) : (
        Object.entries(porGrado).map(([grado, items]) => (
          <div key={grado} className="mb-6">
            <div className="font-display text-xl text-azul mb-2 tracking-wide">{grado}° año</div>
            <div className="grid gap-3">
              {items.map(({ curso, reg, total }) => (
                <CursoEstadoCard key={curso.id} curso={curso} reg={reg} total={total} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
