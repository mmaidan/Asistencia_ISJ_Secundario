import { useEffect, useMemo, useState } from "react";
import { CURSOS, todayISO, formatFecha } from "../lib/data";
import { fetchAsistenciasDelDia } from "../lib/asistenciasApi";
import { CursoEstadoCard } from "./AttendanceUI";

export default function EstadoDelDia() {
  const [fecha, setFecha] = useState(todayISO());
  const [porCurso, setPorCurso] = useState({});
  const [cargando, setCargando] = useState(true);

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

  const porGrado = useMemo(() => {
    const map = {};
    CURSOS.forEach((c) => {
      if (!map[c.grado]) map[c.grado] = [];
      map[c.grado].push({ curso: c, reg: porCurso[c.id] || null });
    });
    return map;
  }, [porCurso]);

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

      {cargando ? (
        <div className="text-center py-12 text-texto2">Cargando...</div>
      ) : (
        Object.entries(porGrado).map(([grado, items]) => (
          <div key={grado} className="mb-6">
            <div className="font-display text-xl text-azul mb-2 tracking-wide">{grado}° año</div>
            <div className="grid gap-3">
              {items.map(({ curso, reg }) => (
                <CursoEstadoCard key={curso.id} curso={curso} reg={reg} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
