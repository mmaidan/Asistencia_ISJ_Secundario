import { supabase } from "./supabaseClient";

const SESION_KEY = "ef-sesion";

// Hasheamos la contraseña en el navegador con SHA-256 antes de guardarla o
// compararla, así nunca viaja ni queda guardada en texto plano.
// (No reemplaza un backend con bcrypt/argon2 "de verdad", pero para una
// app interna de colegio, sin datos sensibles de terceros, es razonable.)
export async function hashClave(clave) {
  const datos = new TextEncoder().encode(clave);
  const buffer = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function loginUsuario(usuario, clave) {
  const claveHash = await hashClave(clave);
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, usuario, nombre, rol, grados")
    .eq("usuario", usuario.trim().toLowerCase())
    .eq("clave_hash", claveHash)
    .maybeSingle();

  if (error || !data) return null;

  localStorage.setItem(SESION_KEY, JSON.stringify(data));
  return data;
}

export function getSesion() {
  try {
    const raw = localStorage.getItem(SESION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function cerrarSesion() {
  localStorage.removeItem(SESION_KEY);
}
