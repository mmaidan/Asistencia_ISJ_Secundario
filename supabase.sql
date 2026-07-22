-- ============================================================
-- Asistencia EF — Instituto San José
-- No usamos Supabase Auth: los usuarios (profes, preceptor, rector)
-- se manejan en una tabla propia, y el ROL RECTOR es quien los crea
-- desde la propia app (pestaña "Usuarios"). Las contraseñas se
-- guardan hasheadas con SHA-256 (se hashean en el navegador, nunca
-- viajan ni se guardan en texto plano).
--
-- Cursos y alumnos también son tablas propias (antes eran datos fijos
-- en el código): el rector puede editar día/horario de cada curso
-- desde la pestaña "Cursos", y dar de alta alumnos uno por uno o
-- importarlos masivamente desde CSV en la pestaña "Alumnos".
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1) Tabla de usuarios
-- ------------------------------------------------------------
create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  usuario text unique not null,
  clave_hash text not null,
  nombre text not null,
  rol text not null check (rol in ('profesor', 'preceptor', 'directivo', 'rector')),
  grados int[] null,
  genero text check (genero in ('Varones', 'Mujeres')),
  created_at timestamptz not null default now()
);

alter table public.usuarios enable row level security;

-- Además de las políticas RLS de abajo, Postgres necesita este permiso
-- "de base" para que el rol anon pueda tocar la tabla. Sin esto, da
-- error "permission denied" (42501) aunque las políticas estén bien.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.usuarios to anon, authenticated;

-- La app se conecta con la clave "anon" de Supabase (no hay login de
-- Supabase Auth), así que estas políticas habilitan el acceso desde
-- ahí. Es una simplificación razonable para una app interna chica;
-- ver el README para más detalle sobre esta limitación.
create policy "acceso app: leer usuarios"
  on public.usuarios for select
  using (true);

create policy "acceso app: crear usuarios"
  on public.usuarios for insert
  with check (true);

create policy "acceso app: editar usuarios"
  on public.usuarios for update
  using (true);

create policy "acceso app: borrar usuarios"
  on public.usuarios for delete
  using (true);

-- ------------------------------------------------------------
-- 2) Tabla de cursos (1° a 6°, dos divisiones, Varones/Mujeres)
-- ------------------------------------------------------------
create table if not exists public.cursos (
  id uuid primary key default gen_random_uuid(),
  grado int not null check (grado between 1 and 6),
  division text not null check (division in ('A', 'B')),
  genero text not null check (genero in ('Varones', 'Mujeres')),
  nombre text not null,
  dia text not null,
  horario text not null
);

alter table public.cursos enable row level security;

grant select, insert, update, delete on public.cursos to anon, authenticated;

create policy "acceso app: leer cursos"
  on public.cursos for select
  using (true);

create policy "acceso app: crear cursos"
  on public.cursos for insert
  with check (true);

create policy "acceso app: editar cursos"
  on public.cursos for update
  using (true);

create policy "acceso app: borrar cursos"
  on public.cursos for delete
  using (true);

-- ------------------------------------------------------------
-- 3) Tabla de alumnos
-- ------------------------------------------------------------
create table if not exists public.alumnos (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references public.cursos(id) on delete cascade,
  apellido text not null,
  nombre text not null,
  sexo text not null check (sexo in ('Varones', 'Mujeres')),
  created_at timestamptz not null default now()
);

alter table public.alumnos enable row level security;

grant select, insert, update, delete on public.alumnos to anon, authenticated;

create policy "acceso app: leer alumnos"
  on public.alumnos for select
  using (true);

create policy "acceso app: crear alumnos"
  on public.alumnos for insert
  with check (true);

create policy "acceso app: editar alumnos"
  on public.alumnos for update
  using (true);

create policy "acceso app: borrar alumnos"
  on public.alumnos for delete
  using (true);

-- ------------------------------------------------------------
-- 4) Tabla de asistencias
-- ------------------------------------------------------------
create table if not exists public.asistencias (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references public.cursos(id) on delete cascade,
  fecha date not null,
  alumno_id uuid not null references public.alumnos(id) on delete cascade,
  estado text not null check (estado in ('presente', 'ausente', 'tarde')),
  hora_guardado text not null,
  creado_por uuid references public.usuarios(id),
  created_at timestamptz not null default now(),
  unique (curso_id, fecha, alumno_id)
);

alter table public.asistencias enable row level security;

grant select, insert, update on public.asistencias to anon, authenticated;

create policy "acceso app: leer asistencias"
  on public.asistencias for select
  using (true);

create policy "acceso app: crear asistencias"
  on public.asistencias for insert
  with check (true);

create policy "acceso app: editar asistencias"
  on public.asistencias for update
  using (true);

-- ------------------------------------------------------------
-- 5) Cursos iniciales (1° a 6°, A/B, Varones/Mujeres)
--    Podés cambiar día y horario de cada uno después, desde la
--    pestaña "Cursos" de la app.
-- ------------------------------------------------------------
insert into public.cursos (grado, division, genero, nombre, dia, horario)
select * from (values
  (1, 'A', 'Varones', '1° A — Varones', 'Lunes', '14:00 a 15:20'),
  (1, 'A', 'Mujeres', '1° A — Mujeres', 'Lunes', '15:30 a 16:50'),
  (1, 'B', 'Varones', '1° B — Varones', 'Martes', '14:00 a 15:20'),
  (1, 'B', 'Mujeres', '1° B — Mujeres', 'Martes', '15:30 a 16:50'),
  (2, 'A', 'Varones', '2° A — Varones', 'Miércoles', '14:00 a 15:20'),
  (2, 'A', 'Mujeres', '2° A — Mujeres', 'Miércoles', '15:30 a 16:50'),
  (2, 'B', 'Varones', '2° B — Varones', 'Jueves', '14:00 a 15:20'),
  (2, 'B', 'Mujeres', '2° B — Mujeres', 'Jueves', '15:30 a 16:50'),
  (3, 'A', 'Varones', '3° A — Varones', 'Lunes', '14:00 a 15:20'),
  (3, 'A', 'Mujeres', '3° A — Mujeres', 'Lunes', '15:30 a 16:50'),
  (3, 'B', 'Varones', '3° B — Varones', 'Martes', '14:00 a 15:20'),
  (3, 'B', 'Mujeres', '3° B — Mujeres', 'Martes', '15:30 a 16:50'),
  (4, 'A', 'Varones', '4° A — Varones', 'Miércoles', '14:00 a 15:20'),
  (4, 'A', 'Mujeres', '4° A — Mujeres', 'Miércoles', '15:30 a 16:50'),
  (4, 'B', 'Varones', '4° B — Varones', 'Jueves', '14:00 a 15:20'),
  (4, 'B', 'Mujeres', '4° B — Mujeres', 'Jueves', '15:30 a 16:50'),
  (5, 'A', 'Varones', '5° A — Varones', 'Lunes', '14:00 a 15:20'),
  (5, 'A', 'Mujeres', '5° A — Mujeres', 'Lunes', '15:30 a 16:50'),
  (5, 'B', 'Varones', '5° B — Varones', 'Martes', '14:00 a 15:20'),
  (5, 'B', 'Mujeres', '5° B — Mujeres', 'Martes', '15:30 a 16:50'),
  (6, 'A', 'Varones', '6° A — Varones', 'Miércoles', '14:00 a 15:20'),
  (6, 'A', 'Mujeres', '6° A — Mujeres', 'Miércoles', '15:30 a 16:50'),
  (6, 'B', 'Varones', '6° B — Varones', 'Jueves', '14:00 a 15:20'),
  (6, 'B', 'Mujeres', '6° B — Mujeres', 'Jueves', '15:30 a 16:50')
) as v(grado, division, genero, nombre, dia, horario)
where not exists (select 1 from public.cursos);

-- ------------------------------------------------------------
-- 6) Rector inicial
--    usuario: rector   (sin contraseña por el momento, a pedido)
-- ------------------------------------------------------------
insert into public.usuarios (usuario, clave_hash, nombre, rol, grados)
values (
  'rector',
  'd7bca09be4f189d975fe722f3f251f178d93eb78efd3c2a5ce8edbd26dd5391c',
  'Rector/a',
  'rector',
  null
)
on conflict (usuario) do nothing;

-- ------------------------------------------------------------
-- 7) Superusuario adicional: admin / admin
--    (a diferencia de "rector", este sí pide la contraseña siempre,
--    porque el bypass sin clave solo aplica al usuario "rector")
-- ------------------------------------------------------------
insert into public.usuarios (usuario, clave_hash, nombre, rol, grados)
values (
  'admin',
  '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  'Administrador',
  'rector',
  null
)
on conflict (usuario) do nothing;

-- ------------------------------------------------------------
-- 8) Configuración general (umbral de alertas de ausentismo)
-- ------------------------------------------------------------
create table if not exists public.configuracion (
  clave text primary key,
  valor text not null
);

alter table public.configuracion enable row level security;
grant select, insert, update on public.configuracion to anon, authenticated;

create policy "acceso app: leer configuracion" on public.configuracion for select using (true);
create policy "acceso app: crear configuracion" on public.configuracion for insert with check (true);
create policy "acceso app: editar configuracion" on public.configuracion for update using (true);

insert into public.configuracion (clave, valor)
values ('umbral_ausencias', '3')
on conflict (clave) do nothing;

-- ------------------------------------------------------------
-- 9) Justificativos de ausencias
-- ------------------------------------------------------------
create table if not exists public.justificativos (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references public.cursos(id) on delete cascade,
  fecha date not null,
  alumno_id uuid not null references public.alumnos(id) on delete cascade,
  motivo text not null,
  creado_por uuid references public.usuarios(id),
  created_at timestamptz not null default now(),
  unique (curso_id, fecha, alumno_id)
);

alter table public.justificativos enable row level security;
grant select, insert, update, delete on public.justificativos to anon, authenticated;

create policy "acceso app: leer justificativos" on public.justificativos for select using (true);
create policy "acceso app: crear justificativos" on public.justificativos for insert with check (true);
create policy "acceso app: editar justificativos" on public.justificativos for update using (true);
create policy "acceso app: borrar justificativos" on public.justificativos for delete using (true);
