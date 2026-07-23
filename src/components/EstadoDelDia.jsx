import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { todayISO, formatFecha, horarioDeHoy, horarioYaPaso, formatHorariosCurso } from "../lib/data";
import { listarCursos } from "../lib/cursosApi";
import { listarTodosLosAlumnos } from "../lib/alumnosApi";
import { fetchAsistenciasDelDia } from "../lib/asistenciasApi";
import AsistenciaEditor from "./AsistenciaEditor";

export default function EstadoDelDia({ userId }) {
  const [fecha, setFecha] = useState(todayISO());
  const [cursos, setCursos] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [porCurso, setPorCurso] = useState({});
  const [cargando, setCargando] = useState(true);
  const [grupoAbierto, setGrupoAbierto] = useState(null);

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
    return cursos.filter((c) => {
      const horarioHoy = horarioDeHoy(c);
      return horarioHoy && horarioYaPaso(horarioHoy) && !porCurso[c.id];
    });
  }, [cursos, porCurso, esHoy]);

  // Agrupamos por año + género: cada grupo junta las divisiones A y B,
  // igual que ahora ve el profesor al tomar asistencia.
  const porGrado = useMemo(() => {
    if (!cursos) return {};
    const gruposPorGenero = {};
    cursos.forEach((c) => {
      const clave = `${c.grado}-${c.genero}`;
      if (!gruposPorGenero[clave]) gruposPorGenero[clave] = { grado: c.grado, genero: c.genero, cursos: [] };
      gruposPorGenero[clave].cursos.push(c);
    });
    const map = {};
    Object.values(gruposPorGenero).forEach((g) => {
      if (!map[g.grado]) map[g.grado] = [];
      map[g.grado].push(g);
    });
    Object.values(map).forEach((lista) => lista.sort((a, b) => a.genero.localeCompare(b.genero)));
    return map;
  }, [cursos]);

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
        Object.entries(porGrado).map(([grado, grupos]) => (
          <div key={grado} className="mb-6">
            <div className="font-display text-xl text-azul mb-2 tracking-wide">{grado}° año</div>
            <div className="grid gap-3">
              {grupos.map((grupo) => {
                const claveGrupo = `${grupo.grado}-${grupo.genero}`;
                const abierto = grupoAbierto === claveGrupo;
                return (
                  <div key={claveGrupo}>
                    <GrupoEstadoCard
                      grupo={grupo}
                      porCurso={porCurso}
                      totalPorCurso={totalPorCurso}
                      atrasados={atrasados}
                      abierto={abierto}
                      onClick={() => setGrupoAbierto(abierto ? null : claveGrupo)}
                    />
                    {abierto && (
                      <div className="bg-tiza border border-t-0 border-borde rounded-b-2xl -mt-2 pt-4 px-4 sm:px-5 pb-5">
                        <AsistenciaEditor cursos={grupo.cursos} fecha={fecha} userId={userId} />
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

function GrupoEstadoCard({ grupo, porCurso, totalPorCurso, atrasados, abierto, onClick }) {
  const { cursos, grado, genero } = grupo;
  const tomadas = cursos.filter((c) => porCurso[c.id]).length;
  const todasTomadas = tomadas === cursos.length;
  const ningunaTomada = tomadas === 0;
  const algunaAtrasada = cursos.some((c) => atrasados.some((a) => a.id === c.id));
  const total = cursos.reduce((acc, c) => acc + (totalPorCurso[c.id] || 0), 0);

  let ausentes = 0;
  let tarde = 0;
  cursos.forEach((c) => {
    const reg = porCurso[c.id];
    if (reg) {
      Object.values(reg.estados).forEach((e) => {
        if (e === "ausente") ausentes++;
        if (e === "tarde") tarde++;
      });
    }
  });

  return (
    <div
      className={`bg-white border rounded-2xl px-4 sm:px-5 py-4 cursor-pointer ${
        algunaAtrasada && !todasTomadas ? "border-rojo-claro" : "border-borde"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="font-semibold text-tinta">
            {grado}° año — {genero}
          </div>
          <div className="text-xs text-texto2">
            {cursos.map((c) => `${formatHorariosCurso(c)} (${c.division})`).join(" · ")}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {todasTomadas ? (
            <span className="text-sm font-medium text-verde bg-verde-claro px-3 py-1 rounded-full">
              Tomada
            </span>
          ) : ningunaTomada ? (
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${
                algunaAtrasada ? "text-rojo bg-rojo-claro" : "text-dorado bg-dorado-claro"
              }`}
            >
              {algunaAtrasada ? "Atrasada" : "Sin registrar"}
            </span>
          ) : (
            <span className="text-sm font-medium text-dorado bg-dorado-claro px-3 py-1 rounded-full">
              Parcial ({tomadas}/{cursos.length})
            </span>
          )}
          <span className="text-xs text-azul font-medium">{abierto ? "Cerrar" : "Ver / editar"}</span>
        </div>
      </div>
      {tomadas > 0 && (
        <div className="flex gap-4 mt-3 text-sm font-mono">
          <span className="text-texto2">
            <span className="text-tinta font-semibold">{total - ausentes}</span>/{total} presentes
          </span>
          {ausentes > 0 && <span className="text-rojo font-semibold">{ausentes} ausentes</span>}
          {tarde > 0 && <span className="text-dorado font-semibold">{tarde} tarde</span>}
        </div>
      )}
    </div>
  );
}
