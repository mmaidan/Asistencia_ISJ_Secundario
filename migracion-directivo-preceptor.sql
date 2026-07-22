-- Permite el rol "directivo" (superusuario, mismo acceso que rector).
-- El "año a cargo" del preceptor usa la misma columna "grados" que ya
-- usaban los profesores (para el preceptor guarda un solo número), así
-- que no hace falta agregar ninguna columna nueva para eso.
alter table public.usuarios drop constraint if exists usuarios_rol_check;
alter table public.usuarios
  add constraint usuarios_rol_check check (rol in ('profesor', 'preceptor', 'directivo', 'rector'));
