import { supabase } from "./supabaseClient";

export async function obtenerUmbralAusencias() {
  const { data } = await supabase
    .from("configuracion")
    .select("valor")
    .eq("clave", "umbral_ausencias")
    .maybeSingle();
  return data ? parseInt(data.valor, 10) || 3 : 3;
}

export async function actualizarUmbralAusencias(valor) {
  const { error } = await supabase
    .from("configuracion")
    .upsert({ clave: "umbral_ausencias", valor: String(valor) }, { onConflict: "clave" });
  if (error) throw error;
}

// Trimestres: [{ inicio: "2026-03-01", fin: "2026-05-31" }, ...] (3 elementos)
export async function obtenerTrimestres() {
  const { data } = await supabase
    .from("configuracion")
    .select("valor")
    .eq("clave", "trimestres")
    .maybeSingle();
  if (!data) return null;
  try {
    const parsed = JSON.parse(data.valor);
    return Array.isArray(parsed) && parsed.length === 3 ? parsed : null;
  } catch (e) {
    return null;
  }
}

export async function actualizarTrimestres(trimestres) {
  const { error } = await supabase
    .from("configuracion")
    .upsert({ clave: "trimestres", valor: JSON.stringify(trimestres) }, { onConflict: "clave" });
  if (error) throw error;
}
