import { useEffect, useMemo, useState } from "react";
import { BarChart3, Settings2 } from "lucide-react";
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
import { obtenerTrimestres, actualizarTrimestres } from "../lib/configuracionApi";

const COLOR_VERDE = "#5F8F55";
const COLOR_ROJO = "#B85C56";
const COLOR_DORADO = "#B98A3E";
const COLOR_AZUL = "#5B7C9D";

const NOMBRES_MES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// grados/genero: si se pasan, se usa para mostrarle al profesor solo SUS
// cursos. Si no se pasan (rector/directivo), se muestran todos.
export default function Estadisticas({ grados, genero, esSuperusuario = false }) {
  const [cursos, setCursos] = useState(null);
  const [filas, setFilas] = useState([]);
  const [cursoId, setCursoId] = useState("");
  const [vista, setVista] = useState("clase"); // "clase" | "mes" | "trimestre"
  const [trimestres, setTrimestres] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([listarCursos(), fetchTodasLasAsistencias(), obtenerTrimestres()]).then(
      ([todos, f, t]) => {
        const propios = esSuperusuario
          ? todos
          : todos.filter(
              (c) => (!grados || grados.includes(c.grado)) && (!genero || c.genero === genero)
            );
        setCursos(propios);
        setFilas(f);
        setTrimestres(t);
        if (propios.length > 0) setCursoId(propios[0].id);
        setCargando(false);
      }
    );
  }, []); // eslint-disable-line

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
    if (vista === "clase") {
      const porFecha = {};
      filasCurso.forEach((f) => {
        if (!porFecha[f.fecha]) porFecha[f.fecha] = { presente: 0, total: 0 };
        porFecha[f.fecha].total++;
        if (f.estado === "presente") porFecha[f.fecha].presente++;
      });
      return Object.entries(porFecha)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([fecha, v]) => ({
          etiqueta: fecha.slice(5).split("-").reverse().join("/"),
          porcentaje: Math.round((v.presente / v.total) * 100),
        }));
    }

    if (vista === "mes") {
      const porMes = {};
      filasCurso.forEach((f) => {
        const clave = f.fecha.slice(0, 7); // YYYY-MM
        if (!porMes[clave]) porMes[clave] = { presente: 0, total: 0 };
        porMes[clave].total++;
        if (f.estado === "presente") porMes[clave].presente++;
      });
      return Object.entries(porMes)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([clave, v]) => {
          const mes = parseInt(clave.slice(5, 7), 10) - 1;
          return {
            etiqueta: NOMBRES_MES[mes].slice(0, 3),
            porcentaje: Math.round((v.presente / v.total) * 100),
          };
        });
    }

    // vista === "trimestre"
    if (!trimestres) return [];
    return trimestres.map((t, i) => {
      const enRango = filasCurso.filter((f) => f.fecha >= t.inicio && f.fecha <= t.fin);
      const presente = enRango.filter((f) => f.estado === "presente").length;
      return {
        etiqueta: `${i + 1}er trim.`,
        porcentaje: enRango.length ? Math.round((presente / enRango.length) * 100) : 0,
        sinDatos: enRango.length === 0,
      };
    });
  }, [filasCurso, vista, trimestres]);

  const totalMarcas = filasCurso.length;
  const clases = new Set(filasCurso.map((f) => f.fecha)).size;
  const curso = cursos?.find((c) => c.id === cursoId);

  if (cargando) {
    return <div className="text-center py-12 text-texto2">Cargando estadísticas...</div>;
  }

  if (!cursos || cursos.length === 0) {
    return (
      <div className="text-center py-16 text-texto2">
        <BarChart3 className="mx-auto mb-3 text-texto3" size={32} />
        No hay cursos para mostrar.
      </div>
    );
  }

  return (
    <div>
      {esSuperusuario && <ConfigTrimestres trimestres={trimestres} onGuardado={setTrimestres} />}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="max-w-xs w-full">
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
        <div>
          <label className="block text-xs font-medium text-texto2 mb-1.5">Ver por</label>
          <div className="flex gap-1.5 bg-white border border-borde rounded-lg p-1 w-fit">
            {[
              { valor: "clase", label: "Clase" },
              { valor: "mes", label: "Mes" },
              { valor: "trimestre", label: "Trimestre" },
            ].map((o) => (
              <button
                key={o.valor}
                onClick={() => setVista(o.valor)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border-none cursor-pointer ${
                  vista === o.valor ? "bg-azul text-white" : "bg-transparent text-texto2"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
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
            <div className="text-sm font-semibold text-tinta mb-1">
              % de presentes por {vista === "clase" ? "clase" : vista === "mes" ? "mes" : "trimestre"}
            </div>
            <div className="text-xs text-texto2 mb-2">{curso?.nombre}</div>
            {vista === "trimestre" && !trimestres ? (
              <div className="text-sm text-texto3 py-8 text-center">
                {esSuperusuario
                  ? "Configurá las fechas de los trimestres arriba para ver este gráfico."
                  : "El rector todavía no configuró las fechas de los trimestres."}
              </div>
            ) : (
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={datosBarras} margin={{ left: -20 }}>
                    <CartesianGrid vertical={false} stroke="#F0ECE1" />
                    <XAxis dataKey="etiqueta" tick={{ fontSize: 11, fill: "#6B6860" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#6B6860" }} />
                    <Tooltip formatter={(v) => [`${v}%`, "Presentes"]} />
                    <Bar dataKey="porcentaje" fill={COLOR_AZUL} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ConfigTrimestres({ trimestres, onGuardado }) {
  const [abierto, setAbierto] = useState(!trimestres);
  const [valores, setValores] = useState(
    trimestres || [
      { inicio: "", fin: "" },
      { inicio: "", fin: "" },
      { inicio: "", fin: "" },
    ]
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  function actualizar(i, campo, valor) {
    setValores((prev) => prev.map((t, idx) => (idx === i ? { ...t, [campo]: valor } : t)));
  }

  async function guardar() {
    if (valores.some((t) => !t.inicio || !t.fin)) {
      setError("Completá las 6 fechas (inicio y fin de cada trimestre).");
      return;
    }
    setError("");
    setGuardando(true);
    try {
      await actualizarTrimestres(valores);
      onGuardado(valores);
      setAbierto(false);
    } catch (e) {
      setError("No se pudieron guardar los trimestres.");
    }
    setGuardando(false);
  }

  return (
    <div className="bg-white border border-borde rounded-2xl p-4 sm:p-5 mb-5">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center justify-between bg-transparent border-none cursor-pointer p-0 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-tinta">
          <Settings2 size={16} /> Fechas de los trimestres
        </span>
        <span className="text-xs text-azul font-medium">{abierto ? "Cerrar" : "Editar"}</span>
      </button>

      {abierto && (
        <div className="mt-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {valores.map((t, i) => (
              <div key={i}>
                <div className="text-xs font-medium text-texto2 mb-1.5">{i + 1}er trimestre</div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={t.inicio}
                    onChange={(e) => actualizar(i, "inicio", e.target.value)}
                    className="border border-borde rounded-lg px-2 py-1.5 text-xs text-tinta w-full"
                  />
                  <span className="text-texto3 text-xs">a</span>
                  <input
                    type="date"
                    value={t.fin}
                    onChange={(e) => actualizar(i, "fin", e.target.value)}
                    className="border border-borde rounded-lg px-2 py-1.5 text-xs text-tinta w-full"
                  />
                </div>
              </div>
            ))}
          </div>
          {error && <div className="text-rojo text-sm mt-3">{error}</div>}
          <button
            onClick={guardar}
            disabled={guardando}
            className="mt-4 bg-bordo disabled:opacity-70 text-white font-semibold px-5 py-2 rounded-xl border-none text-sm cursor-pointer"
          >
            {guardando ? "Guardando..." : "Guardar trimestres"}
          </button>
        </div>
      )}
    </div>
  );
}
