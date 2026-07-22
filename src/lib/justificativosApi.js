import { supabase } from "./supabaseClient";

// Trae los justificativos de una clase puntual: { alumnoId: motivo }
export async function fetchJustificativosClase(cursoId, fecha) {
  const { data, error } = await supabase
    .from("justificativos")
    .select("alumno_id, motivo")
    .eq("curso_id", cursoId)
    .eq("fecha", fecha);
  if (error) return {};
  const mapa = {};
  data.forEach((j) => (mapa[j.alumno_id] = j.motivo));
  return mapa;
}

export async function guardarJustificativo(cursoId, fecha, alumnoId, motivo, userId) {
  const { error } = await supabase
    .from("justificativos")
    .upsert(
      { curso_id: cursoId, fecha, alumno_id: alumnoId, motivo, creado_por: userId },
      { onConflict: "curso_id,fecha,alumno_id" }
    );
  if (error) throw error;
}

export async function borrarJustificativo(cursoId, fecha, alumnoId) {
  const { error } = await supabase
    .from("justificativos")
    .delete()
    .eq("curso_id", cursoId)
    .eq("fecha", fecha)
    .eq("alumno_id", alumnoId);
  if (error) throw error;
}
