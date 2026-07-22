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
    .upsert({ clave: "umbral_ausencias", valor: String(valor) });
  if (error) throw error;
}
