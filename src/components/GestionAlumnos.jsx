import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Trash2, Users2, ChevronDown, ChevronRight } from "lucide-react";
import { listarCursos } from "../lib/cursosApi";
import {
  listarTodosLosAlumnos,
  importarAlumnos,
  eliminarAlumno,
  interpretarCSV,
} from "../lib/alumnosApi";

export default function GestionAlumnos() {
  const [cursos, setCursos] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [error, setError] = useState("");
  const [cursoAbierto, setCursoAbierto] = useState(null);

  useEffect(() => {
    recargar();
  }, []);

  function recargar() {
    Promise.all([listarCursos(), listarTodosLosAlumnos()])
      .then(([c, a]) => {
        setCursos(c);
        setAlumnos(a);
      })
      .catch(() => setError("No se pudieron cargar los datos."));
  }

  const alumnosPorCurso = useMemo(() => {
    const map = {};
    alumnos.forEach((a) => {
      if (!map[a.curso_id]) map[a.curso_id] = [];
      map[a.curso_id].push(a);
    });
    return map;
  }, [alumnos]);

  async function borrarAlumno(id) {
    if (!confirm("¿Borrar este alumno de la lista?")) return;
    try {
      await eliminarAlumno(id);
      recargar();
    } catch (e) {
      setError("No se pudo borrar el alumno.");
    }
  }

  if (error) return <div className="text-rojo text-sm">{error}</div>;
  if (!cursos) return <div className="text-center py-12 text-texto2">Cargando...</div>;

  return (
    <div>
      <ImportarCSV cursos={cursos} onImportado={recargar} />

      <div className="flex items-center gap-2 mb-3 text-tinta font-semibold">
        <Users2 size={18} /> Alumnos por curso
      </div>

      <div className="grid gap-2">
        {cursos.map((c) => {
          const lista = alumnosPorCurso[c.id] || [];
          const abierto = cursoAbierto === c.id;
          return (
            <div key={c.id} className="bg-white border border-borde rounded-xl overflow-hidden">
              <button
                onClick={() => setCursoAbierto(abierto ? null : c.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-transparent border-none cursor-pointer text-left"
              >
                <span className="font-medium text-tinta">{c.nombre}</span>
                <span className="flex items-center gap-2 text-sm text-texto2">
                  {lista.length} alumnos
                  {abierto ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
              </button>
              {abierto && (
                <div className="border-t border-borde2 divide-y divide-borde2">
                  {lista.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-texto3">Sin alumnos cargados.</div>
                  ) : (
                    lista
                      .sort((a, b) => a.apellido.localeCompare(b.apellido))
                      .map((a) => (
                        <div key={a.id} className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-sm text-tinta">
                            {a.apellido}, {a.nombre}
                          </span>
                          <button
                            onClick={() => borrarAlumno(a.id)}
                            className="text-texto3 hover:text-rojo bg-transparent border-none cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ImportarCSV({ cursos, onImportado }) {
  const inputRef = useRef(null);
  const [filas, setFilas] = useState(null);
  const [errorArchivo, setErrorArchivo] = useState("");
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState("");

  function handleArchivo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResultado("");
    const reader = new FileReader();
    reader.onload = () => {
      const texto = reader.result;
      const { filas: parseadas, columnasFaltantes } = interpretarCSV(texto, cursos);
      if (columnasFaltantes.length > 0) {
        setErrorArchivo(
          `No se reconocieron estas columnas en el archivo: ${columnasFaltantes.join(", ")}. Revisá que tenga Apellidos, Nombres, Sexo y Año (o Grado).`
        );
        setFilas(null);
        return;
      }
      setErrorArchivo("");
      setFilas(parseadas);
    };
    // El export oficial viene en latin-1 (con tildes/ñ), así que probamos
    // esa codificación primero para que no se rompan los acentos.
    reader.readAsText(file, "ISO-8859-1");
  }

  function actualizarCursoFila(idx, cursoId) {
    setFilas((prev) => prev.map((f, i) => (i === idx ? { ...f, cursoId, valido: cursoId ? f.valido : false } : f)));
  }

  function actualizarSexoFila(idx, nuevoSexo) {
    setFilas((prev) =>
      prev.map((f, i) => {
        if (i !== idx) return f;
        const cursoActual = cursos.find((c) => c.id === f.cursoId);
        const division = cursoActual?.division || f.divisionDetectada || "A";
        const nuevoCursoId = f.grado
          ? cursos.find((c) => c.grado === f.grado && c.division === division && c.genero === nuevoSexo)
              ?.id || null
          : null;
        return {
          ...f,
          sexo: nuevoSexo,
          cursoId: nuevoCursoId,
          valido: Boolean(f.apellido && f.nombre && nuevoSexo && f.grado),
        };
      })
    );
  }

  async function confirmarImportacion() {
    const listas = filas.filter((f) => f.valido && f.cursoId);
    setImportando(true);
    try {
      await importarAlumnos(
        listas.map((f) => ({
          apellido: f.apellido,
          nombre: f.nombre,
          sexo: f.sexo,
          cursoId: f.cursoId,
        }))
      );
      setResultado(`Se importaron ${listas.length} alumnos correctamente.`);
      setFilas(null);
      if (inputRef.current) inputRef.current.value = "";
      onImportado();
    } catch (e) {
      setErrorArchivo("No se pudo completar la importación. Probá de nuevo.");
    }
    setImportando(false);
  }

  const listosParaImportar = filas?.filter((f) => f.valido && f.cursoId).length || 0;
  const conProblema = filas?.filter((f) => !f.valido || !f.cursoId).length || 0;

  return (
    <div className="bg-white border border-borde rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-2 text-tinta font-semibold">
        <Upload size={18} /> Importar alumnos desde CSV
      </div>
      <p className="text-sm text-texto2 mb-4">
        Subí el archivo tal como lo exporta el sistema de matriculación (con columnas Apellidos,
        Nombres, Sexo y Año/Grado), o una planilla propia con esas mismas columnas. Después vas a
        poder revisar y corregir el curso de cada alumno antes de confirmar.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleArchivo}
        className="text-sm text-texto2 mb-3"
      />

      {errorArchivo && <div className="text-rojo text-sm mb-3">{errorArchivo}</div>}
      {resultado && <div className="text-verde text-sm mb-3">{resultado}</div>}

      {filas && filas.length > 0 && (
        <div>
          <div className="text-sm text-texto2 mb-2">
            {listosParaImportar} listos para importar
            {conProblema > 0 && `, ${conProblema} necesitan revisión (curso o datos incompletos)`}.
          </div>
          <div className="max-h-80 overflow-y-auto border border-borde2 rounded-xl mb-4">
            <table className="w-full text-sm">
              <thead className="bg-tiza sticky top-0">
                <tr className="text-left text-texto2">
                  <th className="px-3 py-2 font-medium">Fila</th>
                  <th className="px-3 py-2 font-medium">Apellido</th>
                  <th className="px-3 py-2 font-medium">Nombre</th>
                  <th className="px-3 py-2 font-medium">Sexo</th>
                  <th className="px-3 py-2 font-medium">Curso</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f, i) => (
                  <tr
                    key={i}
                    className={`border-t border-borde2 ${!f.valido || !f.cursoId ? "bg-dorado-claro" : ""}`}
                  >
                    <td className="px-3 py-2 text-texto3">{f.fila}</td>
                    <td className="px-3 py-2 text-tinta">{f.apellido || "—"}</td>
                    <td className="px-3 py-2 text-tinta">{f.nombre || "—"}</td>
                    <td className="px-3 py-2">
                      <select
                        value={f.sexo || ""}
                        onChange={(e) => actualizarSexoFila(i, e.target.value)}
                        className="border border-borde rounded-lg px-2 py-1 text-xs text-tinta"
                      >
                        <option value="">— Elegir —</option>
                        <option value="Varones">Varones</option>
                        <option value="Mujeres">Mujeres</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={f.cursoId || ""}
                        onChange={(e) => actualizarCursoFila(i, e.target.value)}
                        className="border border-borde rounded-lg px-2 py-1 text-xs text-tinta"
                      >
                        <option value="">— Elegir curso —</option>
                        {cursos.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={confirmarImportacion}
            disabled={importando || listosParaImportar === 0}
            className="bg-bordo disabled:opacity-70 text-white font-semibold px-5 py-2.5 rounded-xl border-none text-sm cursor-pointer"
          >
            {importando ? "Importando..." : `Importar ${listosParaImportar} alumnos`}
          </button>
        </div>
      )}
    </div>
  );
}
