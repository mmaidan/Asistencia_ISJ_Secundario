Asistencia de Educación Física — Instituto San José
====================================================

Esta carpeta es el código completo de la app. Para que funcione online
hay que conectarla a una base de datos gratuita (Supabase) y publicarla
como sitio web (Vercel). Se puede hacer todo desde el navegador, sin
usar la terminal, salvo el paso opcional de probarla en tu computadora.

No hace falta saber programar para seguir estos pasos, pero sí seguir
el orden.

---

Paso 1 — Crear la base de datos (Supabase, gratis)
---------------------------------------------------

1. Andá a https://supabase.com y creá una cuenta gratis (con GitHub o email).
2. Creá un proyecto nuevo (elegí cualquier nombre y contraseña, y una
   región cercana, ej. South America).
3. Cuando el proyecto esté listo, andá a **SQL Editor** (menú izquierdo)
   → **New query**.
4. Abrí el archivo `supabase.sql` de esta carpeta, copiá todo su
   contenido, pegalo ahí, y tocá **Run**.
   - Esto crea las tablas (`usuarios`, `cursos`, `alumnos`, `asistencias`),
     carga los 24 cursos (1° a 6°, A/B, Varones/Mujeres) y un usuario
     **rector** de arranque (sin contraseña, por el momento).
   - **¿Ya tenías el proyecto anterior armado?** No corras este archivo
     de nuevo — usá `migracion-cursos-alumnos.sql` en su lugar (ver más
     abajo, en "Actualizando un proyecto ya existente").
5. Andá a **Project Settings** (ícono de engranaje) → **API**. Vas a
   necesitar dos datos:
   - `Project URL`
   - `anon public key`

Paso 2 — Conectar la app a esa base de datos
---------------------------------------------

1. En esta carpeta, hacé una copia del archivo `.env.example` y
   renombrala a `.env`.
2. Completá los dos valores que copiaste de Supabase:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi....
```

Paso 3 — Probarla en tu computadora (opcional pero recomendado)
------------------------------------------------------------------

Necesitás tener Node.js instalado (versión 18 o más nueva). Después,
en esta carpeta:

```bash
npm install
npm run dev
```

Se abre en `http://localhost:5173`. Entrá con `rector` / `rector2026` y
probá dar de alta un profesor desde la pestaña **Usuarios**.

Paso 4 — Publicarla como sitio web (gratis)
----------------------------------------------

La forma más simple, sin usar la terminal:

1. Subí esta carpeta a GitHub (podés arrastrar los archivos desde
   github.com, creando un repositorio nuevo).
2. Andá a https://vercel.com, entrá con tu cuenta de GitHub, tocá
   **Add New → Project**, elegí el repositorio.
3. En **Environment Variables**, cargá las mismas dos variables del
   Paso 2 (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`).
4. Tocá **Deploy**. En un minuto te da una URL tipo
   `https://asistencia-ef.vercel.app` — esa es tu sitio, ya funcionando
   y accesible desde cualquier celular con internet.

Cada vez que subas cambios a GitHub, Vercel actualiza el sitio solo.

Paso 5 — Primer ingreso, cursos, alumnos y usuarios reales
---------------------------------------------------------------

1. Entrá al sitio escribiendo `rector` como usuario (no pide contraseña
   por el momento).
2. Pestaña **Cursos**: revisá y ajustá el día y horario real de cada
   uno de los 24 cursos (vienen con valores de ejemplo).
3. Pestaña **Alumnos**: subí el CSV de matriculación real (el que ya
   exporta el sistema del colegio, con columnas Apellidos, Nombres,
   Sexo y Año). La app va a mostrarte una vista previa fila por fila
   para que confirmes o corrijas a qué curso pertenece cada alumno
   antes de importar (esto hace falta porque el sistema de
   matriculación no siempre distingue divisiones A/B de la misma
   manera que esta app).
4. Pestaña **Usuarios**: dá de alta a cada profesor con su usuario,
   contraseña, y los años que tiene a cargo (1° a 6°). Repetí para el
   preceptor (sin marcar años).
5. Compartí con cada uno su usuario y contraseña. Ya pueden entrar
   desde su celular a la misma URL de Vercel.

Actualizando un proyecto ya existente
------------------------------------------

Si ya habías corrido una versión anterior de `supabase.sql` (con
`usuarios` ya cargado), **no vuelvas a correr `supabase.sql` entero**.
En vez de eso, corré estas migraciones una sola vez cada una, en este
orden, desde el SQL Editor:

1. `migracion-cursos-alumnos.sql` — agrega `cursos` y `alumnos`, y
   renueva `asistencias` para que las use.
2. `migracion-genero-profesor.sql` — agrega a qué género le da clase
   cada profesor.
3. `migracion-directivo-preceptor.sql` — agrega el rol Directivo (el
   año a cargo del preceptor usa la misma columna que ya tenían los
   profesores, no hace falta una migración aparte para eso).

Ninguna de estas toca los usuarios y contraseñas que ya tenías
cargados.

---

Usuarios de arranque
------------------------

```
usuario: rector    (sin contraseña, por el momento)
usuario: admin     contraseña: admin
```

Ambos son superusuarios (rol "rector"). El de `rector` no pide clave
por el pedido temporal que ya quedó documentado más abajo; `admin` sí
pide contraseña normalmente, por si preferís usar ese en vez de `rector`
mientras dure el bypass.

---

Estructura de la carpeta
----------------------------

```
index.html
package.json
vite.config.js
tailwind.config.js
supabase.sql                    -> tablas, cursos iniciales y usuarios de arranque
migracion-cursos-alumnos.sql    -> para actualizar un proyecto Supabase ya existente
.env.example                     -> copiar a .env y completar
src/
  main.jsx
  App.jsx                   -> sesión y navegación por rol
  lib/
    data.js                   constantes (grados, días) y utilidades de fecha
    supabaseClient.js
    auth.js                    login y sesión (usuario/contraseña propios)
    usuariosApi.js              alta/baja/edición de usuarios (panel rector)
    cursosApi.js                lectura/edición de día y horario de cada curso
    alumnosApi.js               alta, borrado e importación masiva de alumnos
    asistenciasApi.js           lectura/escritura de asistencias
  components/
    Login.jsx
    Header.jsx
    ProfesorView.jsx           toma de asistencia
    EstadoDelDia.jsx           vista de preceptor/rector
    Estadisticas.jsx
    Alertas.jsx
    GestionUsuarios.jsx        panel del rector: usuarios
    GestionCursos.jsx          panel del rector: día y horario
    GestionAlumnos.jsx         panel del rector: importar/gestionar alumnos
```

---

Para tener en cuenta
------------------------

- **El usuario "rector" entra sin contraseña por el momento.** Cualquiera
  que escriba "rector" en el login entra como superusuario. Está así a
  pedido explícito, para simplificar mientras se prueba la app. Antes de
  usarla con datos reales, hay que volver a pedir contraseña: en
  `src/lib/auth.js`, quitar el bloque marcado como "TEMPORAL" dentro de
  `loginUsuario`.
- No se usa Supabase Auth: el login es propio (usuario + contraseña,
  sin email). Esto simplifica el alta de usuarios, pero significa que
  la base de datos queda accesible con la clave pública del proyecto,
  igual que cualquier app sin backend propio. Es razonable para una
  escuela chica sin datos sensibles de terceros.
- Las contraseñas de los demás usuarios se guardan hasheadas (nunca en
  texto plano).
- Los cursos y alumnos ya son editables desde la app (pestañas "Cursos"
  y "Alumnos" del rector) — dejaron de ser datos fijos en el código.
- La importación de alumnos por CSV adivina el curso de cada fila
  cruzando Año + Sexo con la división (A/B). Cuando el sistema de
  matriculación no distingue A/B (por ejemplo, secciones marcadas como
  "única"), la app lo deja para elegir a mano en la vista previa antes
  de confirmar.

Ideas para más adelante
----------------------------

Quedaron anotadas para una próxima vuelta (no están implementadas
todavía):

- Justificativos de ausencias (con motivo, ej. certificado médico)
- Que cada profesor pueda cambiar su propia contraseña
- Editar una asistencia ya guardada, con registro de quién la corrigió
- Aviso automático al preceptor si pasado el horario de clase la
  asistencia todavía no se cargó
- Exportar reportes a PDF o Excel
- Convertir la app en PWA (instalable en el celular con ícono propio)
- Generalizar el esquema a otras materias, no solo Educación Física
