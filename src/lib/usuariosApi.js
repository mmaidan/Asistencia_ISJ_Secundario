import { supabase } from "./supabaseClient";
import { hashClave } from "./auth";

export async function listarUsuarios() {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, usuario, nombre, rol, grados, genero, curso_id, created_at")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function crearUsuario({ usuario, clave, nombre, rol, grados, genero, cursoId }) {
  const clave_hash = await hashClave(clave);
  const { error } = await supabase.from("usuarios").insert({
    usuario: usuario.trim().toLowerCase(),
    clave_hash,
    nombre: nombre.trim(),
    rol,
    grados: rol === "profesor" && grados?.length ? grados : null,
    genero: rol === "profesor" ? genero || null : null,
    curso_id: rol === "preceptor" ? cursoId || null : null,
  });
  if (error) throw error;
}

export async function actualizarGrados(id, grados) {
  const { error } = await supabase
    .from("usuarios")
    .update({ grados: grados?.length ? grados : null })
    .eq("id", id);
  if (error) throw error;
}

export async function actualizarGenero(id, genero) {
  const { error } = await supabase.from("usuarios").update({ genero }).eq("id", id);
  if (error) throw error;
}

export async function actualizarCursoPreceptor(id, cursoId) {
  const { error } = await supabase.from("usuarios").update({ curso_id: cursoId }).eq("id", id);
  if (error) throw error;
}

export async function resetearClave(id, nuevaClave) {
  const clave_hash = await hashClave(nuevaClave);
  const { error } = await supabase.from("usuarios").update({ clave_hash }).eq("id", id);
  if (error) throw error;
}

export async function eliminarUsuario(id) {
  const { error } = await supabase.from("usuarios").delete().eq("id", id);
  if (error) throw error;
}
