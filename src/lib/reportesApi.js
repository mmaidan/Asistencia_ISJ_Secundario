import { supabase } from "./supabaseClient";

// Trae todas las marcas de asistencia de un curso en un rango de fechas,
// con el nombre del alumno ya incluido (usa la relación alumno_id -> alumnos).
export async function fetchReporteCurso(cursoId, desde, hasta) {
  const { data, error } = await supabase
    .from("asistencias")
    .select("fecha, estado, alumno_id, alumnos(nombre, apellido)")
    .eq("curso_id", cursoId)
    .gte("fecha", desde)
    .lte("fecha", hasta)
    .order("fecha", { ascending: true });
  if (error) throw error;
  return data;
}

export function armarResumenPorAlumno(filas) {
  const porAlumno = {};
  filas.forEach((f) => {
    const id = f.alumno_id;
    if (!porAlumno[id]) {
      porAlumno[id] = {
        alumnoId: id,
        nombre: f.alumnos?.nombre || "",
        apellido: f.alumnos?.apellido || "",
        presente: 0,
        ausente: 0,
        tarde: 0,
        total: 0,
      };
    }
    porAlumno[id][f.estado] += 1;
    porAlumno[id].total += 1;
  });
  return Object.values(porAlumno).sort((a, b) => a.apellido.localeCompare(b.apellido));
}

function csvEscape(valor) {
  const s = String(valor ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function descargarCSV(nombreArchivo, encabezados, filas) {
  const lineas = [encabezados.map(csvEscape).join(",")];
  filas.forEach((fila) => lineas.push(fila.map(csvEscape).join(",")));
  const contenido = "\uFEFF" + lineas.join("\n"); // BOM para que Excel abra bien los acentos
  const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
