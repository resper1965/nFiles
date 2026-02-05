-- Tabela de metadados dos projetos (razão social, operadora, tipo/objeto inferidos).
-- A pasta do projeto continua no Storage (userId/name/.keep); esta tabela armazena metadados.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  razao_social text not null,
  operadora text not null,
  tipo_documento text,
  objeto_documento text,
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

-- RLS: usuário só acessa próprios projetos
alter table public.projects enable row level security;

create policy "projects_select_own"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "projects_insert_own"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "projects_update_own"
  on public.projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "projects_delete_own"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Índice para listar por usuário
create index if not exists projects_user_id_idx on public.projects(user_id);
