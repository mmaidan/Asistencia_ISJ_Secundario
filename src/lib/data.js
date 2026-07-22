export const GRADOS = [1, 2, 3, 4, 5, 6];
export const DIVISIONES = ["A", "B"];
export const GENEROS = ["Varones", "Mujeres"];
export const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export function nombreCurso(curso) {
  return `${curso.grado}° ${curso.division} — ${curso.genero}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function formatFecha(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}
