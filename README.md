<div align="center">

# 🏃‍♂️ Asistencia EF — Instituto San José

### Planilla digital de asistencia de Educación Física

*Quines — San Luis*

![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-149ECA?style=for-the-badge&logo=react&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)

</div>

---

## 💡 El problema que resuelve

> El colegio cursa a la mañana. Educación Física se dicta a la tarde.
> El preceptor y el rectorado nunca saben, en el momento, si el profe
> tomó asistencia — y los pibes que faltan quedan sin registrar hasta
> el día siguiente.

**Esta app cierra esa brecha:** el profe marca presente/ausente/tarde
desde el celular en la cancha, y el preceptor y el rector lo ven
reflejado al instante.

---

## 📚 Índice

1. [¿Qué incluye?](#-qué-incluye)
2. [Cómo se ve por rol](#-cómo-se-ve-por-rol)
3. [Cómo funcionan los usuarios](#-cómo-funcionan-los-usuarios)
4. [Arquitectura](#️-arquitectura)
5. [🚀 Puesta en marcha, paso a paso](#-puesta-en-marcha-paso-a-paso)
6. [🔑 Acceso inicial](#-acceso-inicial)
7. [🗂️ Estructura del proyecto](#️-estructura-del-proyecto)
8. [🎨 Paleta institucional](#-paleta-institucional)
9. [🛠️ Notas técnicas y limitaciones](#️-notas-técnicas-y-limitaciones)
10. [❓ Preguntas frecuentes](#-preguntas-frecuentes)

---

## ✅ ¿Qué incluye?

| | |
|---|---|
| 🔐 | Login simple con **usuario y contraseña** (sin email, sin confirmación de correo) |
| 🧑‍💼 | El **rector** da de alta, edita y borra usuarios desde una pestaña dentro de la propia app |
| 🎯 | El rector asigna, con un click, **qué años tiene a cargo cada profesor** |
| 🏫 | Cursos de **1° a 6° año**, divisiones A/B, separados por **Varones / Mujeres** |
| ✅ | Toma de asistencia con un toque: Presente · Ausente · Tarde |
| 👀 | El **preceptor** ve en vivo qué cursos ya tienen asistencia tomada y cuáles no |
| 📊 | El **rector** ve además estadísticas de asistencia y alertas de ausentismo |
| ☁️ | Todo guardado en **Postgres (Supabase)** — accesible desde cualquier dispositivo |
| 🌐 | Deploy gratuito en **Vercel** |

---

## 👥 Cómo se ve por rol

<table>
<tr>
<td width="33%" valign="top">

### 🏃 Profesor
- Ve solo los cursos que el rector le asignó
- Marca presente/ausente/tarde por alumno
- "Marcar todos presentes" con un click
- Ve la hora exacta en que guardó cada clase

</td>
<td width="33%" valign="top">

### 📋 Preceptor
- Ve **todos** los cursos del día, por año
- Verde: asistencia tomada (+ hora)
- Dorado: todavía sin registrar
- Puede navegar a fechas anteriores

</td>
<td width="33%" valign="top">

### 🎓 Rector (superusuario)
- Todo lo del preceptor, más:
- 📈 % de asistencia por curso
- 🚨 Alertas de 3+ ausencias
- 👥 **Pestaña "Usuarios"**: alta, baja y edición de profes/preceptor

</td>
</tr>
</table>

---

## 🔑 Cómo funcionan los usuarios

No hay emails ni links de confirmación. El **rector** es quien controla todo desde la pestaña **"Usuarios"**:

```
┌────────────────────────────────────────────┐
│  👥 Usuarios                                 │
│                                                │
│  ➕ Dar de alta un usuario                     │
│     Nombre: __________  Rol: [Profesor ▾]     │
│     Usuario: ________   Contraseña: ______    │
│     Cursos a cargo:  1° 2° [3°] [4°] 5° 6°    │
│     [ Crear usuario ]                          │
│                                                │
│  📋 Usuarios existentes                        │
│     Prof. Ana Gómez  @profe4 · Profesor        │
│       [ 🔑 Cambiar clave ]  [ 🗑️ Borrar ]        │
│       Cursos: 1° 2° [3°] [4°] 5° 6°  [Guardar] │
└────────────────────────────────────────────┘
```

- Al crear un profesor, el rector toca los años que tiene a cargo
  (podés tocar varios, ej. 3° y 4°) — eso es lo que después filtra
  qué cursos ve ese profe al tomar asistencia.
- Se puede **resetear la contraseña** de cualquiera en cualquier momento
  (por si alguien la olvida), y **borrar** usuarios que ya no correspondan.
- Las contraseñas nunca se guardan en texto plano: se transforman con
  SHA-256 en el propio navegador antes de guardarse o compararse.

---

## 🏗️ Arquitectura

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  Vite + React │ ───▶ │  tabla "usuarios"  │      │   Vercel          │
│  (frontend)   │      │  (login propio)    │      │  (hosting online) │
└──────┬────────┘      └────────────────────┘      └────────▲──────────┘
       │                                                       │
       ▼                                                       │
┌──────────────────────┐                                       │
│  Supabase Postgres    │ ── tabla "asistencias" ──────────────┘
│  (base de datos)       │ ── tabla "usuarios" (roles y claves)
└────────────────────────┘
```

- **GitHub** guarda el código y dispara el deploy automático en Vercel.
- **Supabase** se usa únicamente como base de datos (Postgres) — no
  usamos Supabase Auth, porque el login lo maneja la propia app.

---

## 🚀 Puesta en marcha, paso a paso

### 1️⃣ Crear el proyecto en Supabase

1. Entrá a **[supabase.com](https://supabase.com)** → creá una cuenta gratuita → **New project**.
2. Esperá a que termine de aprovisionarse (1-2 minutos).
3. Andá a **⚙️ Project Settings → API** y copiá:
   - `Project URL`
   - `anon public` key

### 2️⃣ Crear las tablas

Andá a **SQL Editor → New query**, pegá el contenido completo de
[`supabase.sql`](./supabase.sql) y tocá **Run**.

Esto crea:
- la tabla `usuarios` (usuario, contraseña hasheada, rol, años a cargo)
- la tabla `asistencias`
- **un usuario rector inicial**: `rector` / `rector2026` (cambialo apenas entres)

### 3️⃣ Configurar las variables de entorno

Copiá `.env.example` a `.env` y completá:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 4️⃣ Probarlo en tu computadora (opcional)

Necesitás **[Node.js](https://nodejs.org)** (18 o superior):

```bash
npm install
npm run dev
```

Abrí `http://localhost:5173`, entrá con `rector` / `rector2026`, y desde
la pestaña **Usuarios** cargá a tus profes de verdad.

### 5️⃣ Subirlo a GitHub

```bash
git init
git add .
git commit -m "Primera version de la app de asistencia"
git remote add origin https://github.com/TU-USUARIO/asistencia-ef.git
git branch -M main
git push -u origin main
```

### 6️⃣ Desplegar en Vercel

1. Entrá a **[vercel.com](https://vercel.com)** con tu cuenta de GitHub.
2. **Add New → Project** → elegí el repositorio.
3. En **Environment Variables**, cargá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. **Deploy** 🎉 — te da una URL tipo `https://asistencia-ef.vercel.app`.

Cada `git push` a `main` actualiza el sitio solo.

---

## 🔑 Acceso inicial

<div align="center">

| Usuario | Contraseña | Rol |
|:---:|:---:|:---:|
| `rector` | `rector2026` | Rector (superusuario) |

</div>

Con esa cuenta entrás por primera vez y, desde la pestaña **Usuarios**,
das de alta a los profes y al preceptor con sus propias contraseñas.
**Cambiá la contraseña del rector apenas entres.**

---

## 🗂️ Estructura del proyecto

```
asistencia-ef-vite/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── supabase.sql              ← tablas, políticas y rector inicial
├── .env.example
├── src/
│   ├── main.jsx
│   ├── App.jsx                 ← sesión y navegación por rol
│   ├── index.css
│   ├── lib/
│   │   ├── data.js               ← cursos y alumnos (1° a 6°, A/B, Varones/Mujeres)
│   │   ├── supabaseClient.js
│   │   ├── auth.js                ← hash de contraseña, login, sesión
│   │   ├── usuariosApi.js          ← alta/baja/edición de usuarios (panel rector)
│   │   └── asistenciasApi.js       ← lectura/escritura de asistencias
│   └── components/
│       ├── Login.jsx
│       ├── Header.jsx
│       ├── ProfesorView.jsx
│       ├── EstadoDelDia.jsx
│       ├── Estadisticas.jsx
│       ├── Alertas.jsx
│       ├── GestionUsuarios.jsx    ← panel del rector
│       └── AttendanceUI.jsx
└── README.md
```

---

## 🎨 Paleta institucional

Colores tomados del escudo del Instituto San José, en tono pastel — ahora
como colores custom de Tailwind (`bg-azul`, `text-bordo`, `bg-verde-claro`, etc.):

<div align="center">

| Color | Uso | Clase Tailwind |
|---|---|:---:|
| 🔵 Azul | Institucional / botones secundarios | `azul` |
| 🟥 Bordo | Botón principal (login, guardar) | `bordo` |
| 🟢 Verde | Presentes / éxito | `verde` |
| 🟡 Dorado | Llegadas tarde / advertencia | `dorado` |
| 🔴 Rojo | Ausentes / alertas | `rojo` |

</div>

---

## 🛠️ Notas técnicas y limitaciones

- **Sin Supabase Auth:** el login es 100% propio. Esto simplifica mucho
  el alta de usuarios (sin emails, sin confirmaciones), pero tiene una
  contrapartida: las políticas de la base de datos quedan abiertas a
  cualquiera que tenga la clave pública (`anon key`) del proyecto —igual
  que en cualquier app sin backend propio. Es razonable para una escuela
  chica sin datos sensibles de terceros, pero **no lo uses para
  información delicada** (no hay nada como DNI, notas, etc. en esta app).
- Las contraseñas se guardan hasheadas (SHA-256), no en texto plano, pero
  esto **no reemplaza** un sistema de autenticación con backend propio si
  en algún momento el proyecto crece y necesita más seguridad.
- **Cursos y alumnos** (`src/lib/data.js`) son datos fijos en el código.
  Pasarlos a una tabla editable desde la app es el siguiente paso natural.

---

## ❓ Preguntas frecuentes

<details>
<summary><strong>¿Tiene costo?</strong></summary>
<br>
No, para una escuela: Supabase, GitHub y Vercel tienen planes gratuitos
más que suficientes.
</details>

<details>
<summary><strong>¿Cómo agrego un profesor nuevo?</strong></summary>
<br>
Entrás como rector → pestaña "Usuarios" → "Dar de alta un usuario" →
completás nombre, usuario, contraseña y los años que tiene a cargo.
No hace falta tocar la base de datos ni el código.
</details>

<details>
<summary><strong>¿Qué pasa si un profesor se olvida la contraseña?</strong></summary>
<br>
El rector entra a la pestaña "Usuarios", busca a esa persona y toca
"Cambiar clave" para resetearla.
</details>

<details>
<summary><strong>¿Puede haber más de un rector?</strong></summary>
<br>
El SQL inicial crea uno solo, pero se puede dar de alta otro rector
directamente desde el SQL Editor de Supabase con el mismo patrón que
el usuario inicial (no está expuesto en la pestaña "Usuarios" para
evitar crear superusuarios por error).
</details>

---

<div align="center">

*Instituto San José — Quines, San Luis* 🎓

</div>
