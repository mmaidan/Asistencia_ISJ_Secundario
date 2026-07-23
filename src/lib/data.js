export const GRADOS = [1, 2, 3, 4, 5, 6];
export const DIVISIONES = ["A", "B"];
export const GENEROS = ["Varones", "Mujeres"];
export const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export function nombreCurso(curso) {
  return `${curso.grado}° ${curso.division} — ${curso.genero}`;
}

// Un curso puede tener clase una o dos veces por semana (dia/horario y,
// opcionalmente, dia2/horario2). Estas funciones tratan ambas sesiones.

export function sesionesCurso(curso) {
  const sesiones = [];
  if (curso.dia && curso.horario) sesiones.push({ dia: curso.dia, horario: curso.horario });
  if (curso.dia2 && curso.horario2) sesiones.push({ dia: curso.dia2, horario: curso.horario2 });
  return sesiones;
}

export function formatHorariosCurso(curso) {
  return sesionesCurso(curso)
    .map((s) => `${s.dia} ${s.horario}`)
    .join(" · ");
}

export function diaDeHoyEs(dia) {
  const hoy = new Date().toLocaleDateString("es-AR", { weekday: "long" });
  return hoy.toLowerCase() === dia.toLowerCase();
}

// Si hoy toca alguna de las sesiones semanales de este curso, devuelve su
// horario (para saber si ya pasó). Si hoy no le toca clase, devuelve null.
export function horarioDeHoy(curso) {
  const sesionHoy = sesionesCurso(curso).find((s) => diaDeHoyEs(s.dia));
  return sesionHoy ? sesionHoy.horario : null;
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
