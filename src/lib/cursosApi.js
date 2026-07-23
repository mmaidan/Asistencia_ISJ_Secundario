import { supabase } from "./supabaseClient";

export async function listarCursos() {
  const { data, error } = await supabase
    .from("cursos")
    .select("*")
    .order("grado", { ascending: true })
    .order("division", { ascending: true })
    .order("genero", { ascending: true });
  if (error) throw error;
  return data;
}

export async function actualizarHorarioCurso(id, { dia, horario, dia2, horario2 }) {
  const { error } = await supabase
    .from("cursos")
    .update({ dia, horario, dia2: dia2 || null, horario2: horario2 || null })
    .eq("id", id);
  if (error) throw error;
}
