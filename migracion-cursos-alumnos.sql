-- ============================================================
-- MIGRACIÓN: agrega las tablas "cursos" y "alumnos", y renueva
-- "asistencias" para que apunte a ellas (antes usaba textos sueltos
-- como "1A-V", ahora usa el id real de cada curso/alumno).
--
-- OJO: esto borra la tabla "asistencias" actual y la vuelve a crear
-- vacía. Como todavía es una etapa de pruebas (no hay asistencia
-- real cargada), no debería ser un problema. La tabla "usuarios" NO
-- se toca — tus usuarios y contraseñas quedan igual.
-- ============================================================

-- 1) Cursos
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

create policy "acceso app: leer cursos" on public.cursos for select using (true);
create policy "acceso app: crear cursos" on public.cursos for insert with check (true);
create policy "acceso app: editar cursos" on public.cursos for update using (true);
create policy "acceso app: borrar cursos" on public.cursos for delete using (true);

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

-- 2) Alumnos
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

create policy "acceso app: leer alumnos" on public.alumnos for select using (true);
create policy "acceso app: crear alumnos" on public.alumnos for insert with check (true);
create policy "acceso app: editar alumnos" on public.alumnos for update using (true);
create policy "acceso app: borrar alumnos" on public.alumnos for delete using (true);

-- 3) Asistencias (se recrea apuntando a los ids reales de cursos/alumnos)
drop table if exists public.asistencias cascade;

create table public.asistencias (
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

create policy "acceso app: leer asistencias" on public.asistencias for select using (true);
create policy "acceso app: crear asistencias" on public.asistencias for insert with check (true);
create policy "acceso app: editar asistencias" on public.asistencias for update using (true);
