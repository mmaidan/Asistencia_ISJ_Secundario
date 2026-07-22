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

export async function actualizarHorarioCurso(id, { dia, horario }) {
  const { error } = await supabase.from("cursos").update({ dia, horario }).eq("id", id);
  if (error) throw error;
}
