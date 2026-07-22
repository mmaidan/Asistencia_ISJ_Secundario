import { useEffect, useMemo, useState } from "react";
import { FileText, Download } from "lucide-react";
import { todayISO, formatFecha } from "../lib/data";
import { listarCursos } from "../lib/cursosApi";
import { fetchReporteCurso, armarResumenPorAlumno, descargarCSV } from "../lib/reportesApi";

function hace30Dias() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

export default function Reportes() {
  const [cursos, setCursos] = useState(null);
  const [cursoId, setCursoId] = useState("");
  const [desde, setDesde] = useState(hace30Dias());
  const [hasta, setHasta] = useState(todayISO());
  const [filas, setFilas] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listarCursos().then((c) => {
      setCursos(c);
      if (c.length > 0) setCursoId(c[0].id);
    });
  }, []);

  const cursosPorGrado = useMemo(() => {
    if (!cursos) return {};
    const map = {};
    cursos.forEach((c) => {
      if (!map[c.grado]) map[c.grado] = [];
      map[c.grado].push(c);
    });
    return map;
  }, [cursos]);

  const resumen = useMemo(() => (filas ? armarResumenPorAlumno(filas) : []), [filas]);
  const curso = cursos?.find((c) => c.id === cursoId);

  async function generar() {
    if (!cursoId) return;
    setError("");
    setCargando(true);
    try {
      const datos = await fetchReporteCurso(cursoId, desde, hasta);
      setFilas(datos);
    } catch (e) {
      setError("No se pudo generar el reporte.");
    }
    setCargando(false);
  }

  function descargarResumen() {
    descargarCSV(
      `resumen-${curso?.nombre || "curso"}-${desde}-a-${hasta}.csv`,
      ["Apellido", "Nombre", "Presentes", "Ausentes", "Tarde", "Clases", "% asistencia"],
      resumen.map((r) => [
        r.apellido,
        r.nombre,
        r.presente,
        r.ausente,
        r.tarde,
        r.total,
        r.total ? Math.round((r.presente / r.total) * 100) : 0,
      ])
    );
  }

  function descargarDetalle() {
    descargarCSV(
      `detalle-${curso?.nombre || "curso"}-${desde}-a-${hasta}.csv`,
      ["Fecha", "Apellido", "Nombre", "Estado"],
      filas.map((f) => [f.fecha, f.alumnos?.apellido || "", f.alumnos?.nombre || "", f.estado])
    );
  }

  if (!cursos) {
    return <div className="text-center py-12 text-texto2">Cargando cursos...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-tinta font-semibold">
        <FileText size={18} /> Reporte de asistencia
      </div>

      <div className="bg-white border border-borde rounded-2xl p-5 mb-6">
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-texto2 mb-1.5">Curso</label>
            <select
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value)}
              className="w-full box-border border border-borde rounded-lg px-3 py-2.5 text-tinta"
            >
              {Object.entries(cursosPorGrado).map(([grado, lista]) => (
                <optgroup key={grado} label={`${grado}°`}>
                  {lista.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.division} — {c.genero}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-texto2 mb-1.5">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full box-border border border-borde rounded-lg px-3 py-2.5 text-tinta"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-texto2 mb-1.5">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full box-border border border-borde rounded-lg px-3 py-2.5 text-tinta"
            />
          </div>
        </div>
        <button
          onClick={generar}
          disabled={cargando || !cursoId}
          className="bg-bordo disabled:opacity-70 text-white font-semibold px-5 py-2.5 rounded-xl border-none text-sm cursor-pointer"
        >
          {cargando ? "Generando..." : "Generar reporte"}
        </button>
      </div>

      {error && <div className="text-rojo text-sm mb-4">{error}</div>}

      {filas && (
        <div>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="text-sm text-texto2">
              {curso?.nombre} · {formatFecha(desde)} a {formatFecha(hasta)} · {filas.length} marcas
              registradas
            </div>
            {filas.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={descargarResumen}
                  className="flex items-center gap-1.5 text-xs font-medium text-azul bg-azul-claro px-3 py-1.5 rounded-full border-none cursor-pointer"
                >
                  <Download size={13} /> Resumen (CSV)
                </button>
                <button
                  onClick={descargarDetalle}
                  className="flex items-center gap-1.5 text-xs font-medium text-azul bg-azul-claro px-3 py-1.5 rounded-full border-none cursor-pointer"
                >
                  <Download size={13} /> Detalle por día (CSV)
                </button>
              </div>
            )}
          </div>

          {resumen.length === 0 ? (
            <div className="text-center py-12 text-texto2">
              No hay asistencia registrada en ese rango para este curso.
            </div>
          ) : (
            <div className="bg-white border border-borde rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-tiza">
                  <tr className="text-left text-texto2">
                    <th className="px-4 py-2.5 font-medium">Alumno</th>
                    <th className="px-4 py-2.5 font-medium text-center">Presentes</th>
                    <th className="px-4 py-2.5 font-medium text-center">Ausentes</th>
                    <th className="px-4 py-2.5 font-medium text-center">Tarde</th>
                    <th className="px-4 py-2.5 font-medium text-center">% asistencia</th>
                  </tr>
                </thead>
                <tbody>
                  {resumen.map((r) => (
                    <tr key={r.alumnoId} className="border-t border-borde2">
                      <td className="px-4 py-2.5 text-tinta">
                        {r.apellido}, {r.nombre}
                      </td>
                      <td className="px-4 py-2.5 text-center text-verde font-medium">{r.presente}</td>
                      <td className="px-4 py-2.5 text-center text-rojo font-medium">{r.ausente}</td>
                      <td className="px-4 py-2.5 text-center text-dorado font-medium">{r.tarde}</td>
                      <td className="px-4 py-2.5 text-center font-mono text-tinta">
                        {r.total ? Math.round((r.presente / r.total) * 100) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
