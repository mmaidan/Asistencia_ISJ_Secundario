-- ============================================================
-- Asistencia EF — Instituto San José
-- No usamos Supabase Auth: los usuarios (profes, preceptor, rector)
-- se manejan en una tabla propia, y el ROL RECTOR es quien los crea
-- desde la propia app (pestaña "Usuarios"). Las contraseñas se
-- guardan hasheadas con SHA-256 (se hashean en el navegador, nunca
-- viajan ni se guardan en texto plano).
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
  rol text not null check (rol in ('profesor', 'preceptor', 'rector')),
  grados int[] null,
  created_at timestamptz not null default now()
);

alter table public.usuarios enable row level security;

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
-- 2) Tabla de asistencias
-- ------------------------------------------------------------
create table if not exists public.asistencias (
  id uuid primary key default gen_random_uuid(),
  curso_id text not null,
  fecha date not null,
  alumno_id text not null,
  estado text not null check (estado in ('presente', 'ausente', 'tarde')),
  hora_guardado text not null,
  creado_por uuid references public.usuarios(id),
  created_at timestamptz not null default now(),
  unique (curso_id, fecha, alumno_id)
);

alter table public.asistencias enable row level security;

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
-- 3) Rector inicial
--    usuario: rector   /   contraseña: rector2026
--    (el hash de abajo corresponde a "rector2026" — cambiala apenas
--    entres, desde la pestaña "Usuarios" → "Cambiar clave")
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
