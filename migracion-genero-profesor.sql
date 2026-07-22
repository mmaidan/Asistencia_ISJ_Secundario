-- Agrega el campo "genero" a la tabla usuarios: define si un profesor
-- da clase a Varones o a Mujeres (nunca a ambos a la vez).
alter table public.usuarios
  add column if not exists genero text check (genero in ('Varones', 'Mujeres'));
