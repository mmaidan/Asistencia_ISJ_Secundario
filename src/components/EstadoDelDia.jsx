import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { todayISO, formatFecha, diaDeHoyEs, horarioYaPaso } from "../lib/data";
import { listarCursos } from "../lib/cursosApi";
import { listarTodosLosAlumnos } from "../lib/alumnosApi";
import { fetchAsistenciasDelDia } from "../lib/asistenciasApi";
import { CursoEstadoCard } from "./AttendanceUI";
import AsistenciaEditor from "./AsistenciaEditor";

export default function EstadoDelDia({ userId }) {
  const [fecha, setFecha] = useState(todayISO());
  const [cursos, setCursos] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [porCurso, setPorCurso] = useState({});
  const [cargando, setCargando] = useState(true);
  const [cursoAbierto, setCursoAbierto] = useState(null);

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

  const esHoy = fecha === todayISO();

  const atrasados = useMemo(() => {
    if (!cursos || !esHoy) return [];
    return cursos.filter(
      (c) => diaDeHoyEs(c.dia) && horarioYaPaso(c.horario) && !porCurso[c.id]
    );
  }, [cursos, porCurso, esHoy]);

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
      {atrasados.length > 0 && (
        <div className="flex items-start gap-2.5 bg-rojo-claro text-rojo rounded-xl px-4 py-3 mb-5 text-sm">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">
              {atrasados.length === 1
                ? "Hay una clase de hoy que ya terminó y no tiene asistencia cargada:"
                : `Hay ${atrasados.length} clases de hoy que ya terminaron y no tienen asistencia cargada:`}
            </div>
            <div>{atrasados.map((c) => c.nombre).join(" · ")}</div>
          </div>
        </div>
      )}

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
              {items.map(({ curso, reg, total }) => {
                const abierto = cursoAbierto === curso.id;
                return (
                  <div key={curso.id}>
                    <CursoEstadoCard
                      curso={curso}
                      reg={reg}
                      total={total}
                      atrasado={atrasados.some((c) => c.id === curso.id)}
                      abierto={abierto}
                      onClick={() => setCursoAbierto(abierto ? null : curso.id)}
                    />
                    {abierto && (
                      <div className="bg-tiza border border-t-0 border-borde rounded-b-2xl -mt-2 pt-4 px-4 sm:px-5 pb-5">
                        <AsistenciaEditor cursoId={curso.id} fecha={fecha} userId={userId} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
