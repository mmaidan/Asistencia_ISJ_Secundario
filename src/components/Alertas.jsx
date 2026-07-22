import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bell, Settings2 } from "lucide-react";
import { listarCursos } from "../lib/cursosApi";
import { listarTodosLosAlumnos } from "../lib/alumnosApi";
import { fetchTodasLasAsistencias } from "../lib/asistenciasApi";
import { obtenerUmbralAusencias, actualizarUmbralAusencias } from "../lib/configuracionApi";

export default function Alertas() {
  const [cursos, setCursos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [filas, setFilas] = useState([]);
  const [umbral, setUmbral] = useState(3);
  const [editandoUmbral, setEditandoUmbral] = useState(false);
  const [umbralTemp, setUmbralTemp] = useState("3");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([
      listarCursos(),
      listarTodosLosAlumnos(),
      fetchTodasLasAsistencias(),
      obtenerUmbralAusencias(),
    ]).then(([c, a, f, u]) => {
      setCursos(c);
      setAlumnos(a);
      setFilas(f);
      setUmbral(u);
      setUmbralTemp(String(u));
      setCargando(false);
    });
  }, []);

  async function guardarUmbral() {
    const n = parseInt(umbralTemp, 10);
    if (!n || n < 1) return;
    try {
      await actualizarUmbralAusencias(n);
      setUmbral(n);
      setEditandoUmbral(false);
    } catch (e) {
      // si falla, dejamos el formulario abierto para reintentar
    }
  }

  const alertas = useMemo(() => {
    const conteo = {};
    filas.forEach((f) => {
      if (f.estado === "ausente") {
        conteo[f.alumno_id] = (conteo[f.alumno_id] || 0) + 1;
      }
    });
    return Object.entries(conteo)
      .filter(([, n]) => n >= umbral)
      .map(([alumnoId, n]) => {
        const alumno = alumnos.find((a) => a.id === alumnoId);
        const curso = cursos.find((c) => c.id === alumno?.curso_id);
        return { alumno, curso, n };
      })
      .filter((a) => a.alumno && a.curso)
      .sort((a, b) => b.n - a.n);
  }, [filas, alumnos, cursos, umbral]);

  if (cargando) {
    return <div className="text-center py-12 text-texto2">Cargando alertas...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="text-sm text-texto2">
          Mostrando alumnos con <strong className="text-tinta">{umbral} o más</strong> ausencias
          registradas.
        </div>
        {editandoUmbral ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={umbralTemp}
              onChange={(e) => setUmbralTemp(e.target.value)}
              className="w-16 border border-borde rounded-lg px-2 py-1.5 text-sm text-tinta"
            />
            <button
              onClick={guardarUmbral}
              className="text-xs font-medium text-white bg-verde px-3 py-1.5 rounded-full border-none cursor-pointer"
            >
              Guardar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditandoUmbral(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-azul bg-azul-claro px-3 py-1.5 rounded-full border-none cursor-pointer"
          >
            <Settings2 size={13} /> Cambiar umbral
          </button>
        )}
      </div>

      {alertas.length === 0 ? (
        <div className="text-center py-16 text-texto2">
          <Bell className="mx-auto mb-3 text-texto3" size={32} />
          No hay alumnos con {umbral} o más ausencias registradas todavía.
        </div>
      ) : (
        <div className="grid gap-3">
          {alertas.map(({ alumno, curso, n }) => (
            <div key={alumno.id} className="flex items-center justify-between bg-white border border-rojo-claro rounded-2xl px-4 sm:px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-rojo-claro text-rojo flex items-center justify-center shrink-0">
                  <AlertTriangle size={17} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-tinta truncate">
                    {alumno.apellido}, {alumno.nombre}
                  </div>
                  <div className="text-xs text-texto2 truncate">{curso.nombre}</div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="font-mono text-lg font-bold text-rojo leading-none">{n}</div>
                <div className="text-[11px] text-texto2">ausencias</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
