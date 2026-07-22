import { useEffect, useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { listarCursos } from "../lib/cursosApi";
import { fetchTodasLasAsistencias } from "../lib/asistenciasApi";

const COLOR_VERDE = "#5F8F55";
const COLOR_ROJO = "#B85C56";
const COLOR_DORADO = "#B98A3E";
const COLOR_AZUL = "#5B7C9D";

export default function Estadisticas() {
  const [cursos, setCursos] = useState(null);
  const [filas, setFilas] = useState([]);
  const [cursoId, setCursoId] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([listarCursos(), fetchTodasLasAsistencias()]).then(([c, f]) => {
      setCursos(c);
      setFilas(f);
      if (c.length > 0) setCursoId(c[0].id);
      setCargando(false);
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

  const filasCurso = useMemo(() => filas.filter((f) => f.curso_id === cursoId), [filas, cursoId]);

  const datosTorta = useMemo(() => {
    let presente = 0,
      ausente = 0,
      tarde = 0;
    filasCurso.forEach((f) => {
      if (f.estado === "presente") presente++;
      if (f.estado === "ausente") ausente++;
      if (f.estado === "tarde") tarde++;
    });
    return [
      { name: "Presentes", value: presente, color: COLOR_VERDE },
      { name: "Ausentes", value: ausente, color: COLOR_ROJO },
      { name: "Tarde", value: tarde, color: COLOR_DORADO },
    ].filter((d) => d.value > 0);
  }, [filasCurso]);

  const datosBarras = useMemo(() => {
    const porFecha = {};
    filasCurso.forEach((f) => {
      if (!porFecha[f.fecha]) porFecha[f.fecha] = { presente: 0, total: 0 };
      porFecha[f.fecha].total++;
      if (f.estado === "presente") porFecha[f.fecha].presente++;
    });
    return Object.entries(porFecha)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, v]) => ({
        fecha: fecha.slice(5).split("-").reverse().join("/"), // DD/MM
        porcentaje: Math.round((v.presente / v.total) * 100),
      }));
  }, [filasCurso]);

  const totalMarcas = filasCurso.length;
  const clases = new Set(filasCurso.map((f) => f.fecha)).size;
  const curso = cursos?.find((c) => c.id === cursoId);

  if (cargando) {
    return <div className="text-center py-12 text-texto2">Cargando estadísticas...</div>;
  }

  return (
    <div>
      <div className="mb-5 max-w-xs">
        <label className="block text-xs font-medium text-texto2 mb-1.5">Curso</label>
        <select
          value={cursoId}
          onChange={(e) => setCursoId(e.target.value)}
          className="w-full box-border border border-borde rounded-lg px-3 py-2.5 bg-white text-tinta font-medium"
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

      {totalMarcas === 0 ? (
        <div className="text-center py-16 text-texto2">
          <BarChart3 className="mx-auto mb-3 text-texto3" size={32} />
          Todavía no hay clases registradas para {curso?.nombre}.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="bg-white border border-borde rounded-2xl p-4 sm:p-5">
            <div className="text-sm font-semibold text-tinta mb-1">Distribución general</div>
            <div className="text-xs text-texto2 mb-2">{clases} clases registradas</div>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={datosTorta}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {datosTorta.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={24} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-borde rounded-2xl p-4 sm:p-5">
            <div className="text-sm font-semibold text-tinta mb-1">% de presentes por clase</div>
            <div className="text-xs text-texto2 mb-2">{curso?.nombre}</div>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={datosBarras} margin={{ left: -20 }}>
                  <CartesianGrid vertical={false} stroke="#F0ECE1" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#6B6860" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#6B6860" }} />
                  <Tooltip formatter={(v) => [`${v}%`, "Presentes"]} />
                  <Bar dataKey="porcentaje" fill={COLOR_AZUL} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
