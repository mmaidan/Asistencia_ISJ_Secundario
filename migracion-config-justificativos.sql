-- 1) Configuración general (por ahora, solo el umbral de alertas)
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

-- 2) Justificativos de ausencias (motivo asociado a una falta puntual)
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
