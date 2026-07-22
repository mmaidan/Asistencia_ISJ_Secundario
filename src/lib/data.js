export const GRADOS = [1, 2, 3, 4, 5, 6];
export const DIVISIONES = ["A", "B"];
export const GENEROS = ["Varones", "Mujeres"];
export const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export function nombreCurso(curso) {
  return `${curso.grado}° ${curso.division} — ${curso.genero}`;
}

export function diaDeHoyEs(dia) {
  const hoy = new Date().toLocaleDateString("es-AR", { weekday: "long" });
  return hoy.toLowerCase() === dia.toLowerCase();
}

export function horarioYaPaso(horario) {
  const partes = horario.split(" a ");
  const fin = (partes[1] || partes[0] || "").trim();
  const match = fin.match(/(\d{1,2}):(\d{2})/);
  if (!match) return false;
  const finHoy = new Date();
  finHoy.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return new Date() > finHoy;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function formatFecha(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}
