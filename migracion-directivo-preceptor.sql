-- 1) Permitir el rol "directivo" (superusuario, igual acceso que rector)
alter table public.usuarios drop constraint if exists usuarios_rol_check;
alter table public.usuarios
  add constraint usuarios_rol_check check (rol in ('profesor', 'preceptor', 'directivo', 'rector'));

-- 2) El preceptor pasa a tener un solo curso a cargo (no todos los cursos)
alter table public.usuarios
  add column if not exists curso_id uuid references public.cursos(id);
