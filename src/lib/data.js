export const GRADOS = [1, 2, 3, 4, 5, 6];
export const DIVISIONES = ["A", "B"];
export const GENEROS = ["Varones", "Mujeres"];

const HORARIOS = [
  { dia: "Lunes", horario: "14:00 a 15:20" },
  { dia: "Lunes", horario: "15:30 a 16:50" },
  { dia: "Martes", horario: "14:00 a 15:20" },
  { dia: "Martes", horario: "15:30 a 16:50" },
  { dia: "Miércoles", horario: "14:00 a 15:20" },
  { dia: "Miércoles", horario: "15:30 a 16:50" },
  { dia: "Jueves", horario: "14:00 a 15:20" },
  { dia: "Jueves", horario: "15:30 a 16:50" },
];

function buildCursos() {
  const out = [];
  let h = 0;
  GRADOS.forEach((grado) => {
    DIVISIONES.forEach((division) => {
      GENEROS.forEach((genero) => {
        const slot = HORARIOS[h % HORARIOS.length];
        out.push({
          id: `${grado}${division}-${genero === "Varones" ? "V" : "M"}`,
          grado,
          division,
          genero,
          nombre: `${grado}° ${division} — ${genero}`,
          dia: slot.dia,
          horario: slot.horario,
        });
        h++;
      });
    });
  });
  return out;
}

export const CURSOS = buildCursos();

const NOMBRES_VARONES = [
  "Bautista Cano", "Enzo Fariña", "Ignacio Herrera", "Lautaro Juárez", "Nahuel López", "Pedro Núñez",
  "Santino Gómez", "Valentino Iturbe", "Alan Navarro", "Ciro Pereyra", "Elián Rivas", "Gael Torres",
  "Ian Vera", "Kevin Ximénez", "Mateo Acosta", "Oscar Correa", "Rocco Encina", "Tomás Gaitán",
  "Valentín Juncos", "Yago Molina", "Axel Ojeda", "Benjamín Paz", "Dante Ramos", "Franco Toledo",
  "Hugo Vega", "Joaquín Ybarra", "Lucas Aguirre", "Nicolás Cabrera", "Pablo Esquivel", "Bruno Sánchez",
  "Ramiro Ortiz", "Agustín Molina", "Facundo Díaz", "Tobías Romero", "Thiago Luna", "Máximo Ibáñez",
  "Julián Castro", "Simón Vega", "Matías Rojas", "Gonzalo Peralta",
];

const NOMBRES_MUJERES = [
  "Agustina Bravo", "Camila Duarte", "Guadalupe Godoy", "Julieta Ibáñez", "Milagros Klein", "Ornella Medina",
  "Abril Ortega", "Catalina Quiroga", "Emilia Sosa", "Giuliana Urrutia", "Ivana Weiss", "Kiara Zapata",
  "Martina Blanco", "Olivia Díaz", "Renata Flores", "Tiziana Huerta", "Ximena Jara", "Yamila Ledesma",
  "Zoe Maldonado", "Bianca Ocampo", "Delfina Quintana", "Fiorella Salas", "Helena Uriarte", "Jazmín Wagner",
  "Luana Yañez", "Naiara Britez", "Priscila Domínguez", "Sofía Farías", "Uma Insaurralde", "Wanda Lucero",
  "Zaira Nieva", "Valentina Paz", "Micaela Ferreyra", "Rocío Álvarez", "Antonella Cruz", "Brisa Molina",
  "Candela Ruiz", "Dalma Ponce", "Elena Soto", "Florencia Vidal",
];

function buildAlumnos() {
  const out = [];
  let vOffset = 0;
  let mOffset = 0;
  CURSOS.forEach((curso) => {
    const esVarones = curso.genero === "Varones";
    const pool = esVarones ? NOMBRES_VARONES : NOMBRES_MUJERES;
    const offset = esVarones ? vOffset : mOffset;
    const count = 11;
    for (let i = 0; i < count; i++) {
      const idx = (offset + i) % pool.length;
      out.push({ id: `${curso.id}-${i + 1}`, cursoId: curso.id, nombre: pool[idx] });
    }
    if (esVarones) vOffset += 3;
    else mOffset += 3;
  });
  return out;
}

export const ALUMNOS = buildAlumnos();

export function alumnosDeCurso(cursoId) {
  return ALUMNOS.filter((a) => a.cursoId === cursoId);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function formatFecha(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}
