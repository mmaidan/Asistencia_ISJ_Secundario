import { supabase } from "./supabaseClient";

export async function listarAlumnosPorCurso(cursoId) {
  const { data, error } = await supabase
    .from("alumnos")
    .select("*")
    .eq("curso_id", cursoId)
    .order("apellido", { ascending: true });
  if (error) throw error;
  return data;
}

export async function listarTodosLosAlumnos() {
  const { data, error } = await supabase.from("alumnos").select("*");
  if (error) throw error;
  return data;
}

export async function eliminarAlumno(id) {
  const { error } = await supabase.from("alumnos").delete().eq("id", id);
  if (error) throw error;
}

export async function importarAlumnos(filas) {
  // filas: [{ apellido, nombre, sexo, cursoId }]
  const { error } = await supabase.from("alumnos").insert(
    filas.map((f) => ({
      apellido: f.apellido,
      nombre: f.nombre,
      sexo: f.sexo,
      curso_id: f.cursoId,
    }))
  );
  if (error) throw error;
}

// ---------------------------------------------------------------
// Interpretación del CSV. Acepta tanto el export oficial del sistema
// de matriculación (APELLIDOS, NOMBRES, SEXO, GRADO/AÑO, SECCION,
// separado por comas, con comillas) como una planilla simple propia
// (apellido, nombre, sexo, grado, division).
// ---------------------------------------------------------------

const ALIAS_COLUMNAS = {
  apellido: ["apellidos", "apellido"],
  nombre: ["nombres", "nombre"],
  sexo: ["sexo", "genero", "género"],
  grado: ["grado/año", "grado/ano", "grado", "año", "ano", "curso"],
  division: ["seccion", "sección", "division", "división"],
};

const PALABRAS_GRADO = {
  primer: 1,
  primero: 1,
  segundo: 2,
  tercer: 3,
  tercero: 3,
  cuarto: 4,
  quinto: 5,
  sexto: 6,
};

function normalizar(s) {
  return (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function parseCSV(texto) {
  // Parser simple de CSV con comillas, separado por comas. Suficiente
  // para el export del sistema de matriculación y para planillas
  // hechas a mano en Excel/Sheets exportadas como CSV.
  const filas = [];
  let fila = [];
  let campo = "";
  let entreComillas = false;

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    const siguiente = texto[i + 1];

    if (entreComillas) {
      if (c === '"' && siguiente === '"') {
        campo += '"';
        i++;
      } else if (c === '"') {
        entreComillas = false;
      } else {
        campo += c;
      }
    } else if (c === '"') {
      entreComillas = true;
    } else if (c === ",") {
      fila.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && siguiente === "\n") continue;
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = "";
    } else {
      campo += c;
    }
  }
  if (campo.length > 0 || fila.length > 0) {
    fila.push(campo);
    filas.push(fila);
  }
  return filas.filter((f) => f.some((c) => c.trim() !== ""));
}

function detectarGrado(valor) {
  const v = normalizar(valor);
  if (!v) return null;
  const soloNumero = v.match(/\d/);
  if (soloNumero) {
    const n = parseInt(v.match(/\d+/)[0], 10);
    if (n >= 1 && n <= 6) return n;
  }
  for (const [palabra, num] of Object.entries(PALABRAS_GRADO)) {
    if (v.includes(palabra)) return num;
  }
  return null;
}

function detectarSexo(valor) {
  const v = normalizar(valor);
  if (v.startsWith("m") || v.includes("varon")) return "Varones";
  if (v.startsWith("f") || v.includes("mujer")) return "Mujeres";
  return null;
}

function detectarDivision(valor) {
  const v = normalizar(valor);
  if (v === "a") return "A";
  if (v === "b") return "B";
  return null; // "u" (única) u otro valor no reconocido: se deja para elegir a mano
}

// Devuelve { filas, columnasFaltantes } donde cada fila trae los datos
// crudos + el curso "adivinado" (o null si no se pudo inferir).
export function interpretarCSV(texto, cursos) {
  const tabla = parseCSV(texto);
  if (tabla.length < 2) return { filas: [], columnasFaltantes: ["archivo vacío"] };

  const encabezado = tabla[0].map((h) => normalizar(h));
  const indices = {};
  for (const [campo, alias] of Object.entries(ALIAS_COLUMNAS)) {
    const idx = encabezado.findIndex((h) => alias.includes(h));
    if (idx !== -1) indices[campo] = idx;
  }

  const columnasFaltantes = ["apellido", "nombre", "sexo", "grado"].filter(
    (c) => indices[c] === undefined
  );
  if (columnasFaltantes.length > 0) {
    return { filas: [], columnasFaltantes };
  }

  const filas = tabla.slice(1).map((cols, i) => {
    const apellido = (cols[indices.apellido] || "").trim();
    const nombre = (cols[indices.nombre] || "").trim();
    const sexoRaw = cols[indices.sexo] || "";
    const gradoRaw = cols[indices.grado] || "";
    const divisionRaw = indices.division !== undefined ? cols[indices.division] || "" : "";

    const sexo = detectarSexo(sexoRaw);
    const grado = detectarGrado(gradoRaw);
    const divisionDetectada = detectarDivision(divisionRaw) || "A";

    const cursoId =
      grado && sexo
        ? cursos.find(
            (c) => c.grado === grado && c.division === divisionDetectada && c.genero === sexo
          )?.id || null
        : null;

    return {
      fila: i + 2, // +2: fila 1 es encabezado, y es 1-indexado para el usuario
      apellido,
      nombre,
      sexoRaw,
      sexo,
      gradoRaw,
      grado,
      divisionRaw,
      divisionDetectada,
      cursoId,
      valido: Boolean(apellido && nombre && sexo && grado),
    };
  });

  return { filas, columnasFaltantes: [] };
}
