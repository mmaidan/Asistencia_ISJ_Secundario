import { supabase } from "./supabaseClient";

// Trae la asistencia de UN curso en UNA fecha puntual.
// Devuelve { horaGuardado, estados: { alumnoId: "presente"|"ausente"|"tarde" } } o null.
export async function fetchAsistenciaCurso(cursoId, fecha) {
  const { data, error } = await supabase
    .from("asistencias")
    .select("alumno_id, estado, hora_guardado")
    .eq("curso_id", cursoId)
    .eq("fecha", fecha);

  if (error || !data || data.length === 0) return null;

  const estados = {};
  data.forEach((row) => {
    estados[row.alumno_id] = row.estado;
  });

  return { horaGuardado: data[0].hora_guardado, estados };
}

// Trae la asistencia de TODOS los cursos en UNA fecha (para preceptor/rector).
// Devuelve { [cursoId]: { horaGuardado, estados } }
export async function fetchAsistenciasDelDia(fecha) {
  const { data, error } = await supabase
    .from("asistencias")
    .select("curso_id, alumno_id, estado, hora_guardado")
    .eq("fecha", fecha);

  if (error || !data) return {};

  const porCurso = {};
  data.forEach((row) => {
    if (!porCurso[row.curso_id]) {
      porCurso[row.curso_id] = { horaGuardado: row.hora_guardado, estados: {} };
    }
    porCurso[row.curso_id].estados[row.alumno_id] = row.estado;
  });
  return porCurso;
}

// Trae TODA la tabla (para estadísticas y alertas). En una escuela esto sigue
// siendo un volumen chico, pero si crece mucho conviene mover el cálculo a SQL.
export async function fetchTodasLasAsistencias() {
  const { data, error } = await supabase
    .from("asistencias")
    .select("curso_id, fecha, alumno_id, estado");

  if (error || !data) return [];
  return data;
}

// Guarda (o actualiza) la asistencia de un curso completo para una fecha.
export async function guardarAsistencia(cursoId, fecha, estados, userId) {
  const horaGuardado = new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const filas = Object.entries(estados).map(([alumnoId, estado]) => ({
    curso_id: cursoId,
    fecha,
    alumno_id: alumnoId,
    estado,
    hora_guardado: horaGuardado,
    creado_por: userId,
  }));

  const { error } = await supabase
    .from("asistencias")
    .upsert(filas, { onConflict: "curso_id,fecha,alumno_id" });

  if (error) throw error;
  return horaGuardado;
}
