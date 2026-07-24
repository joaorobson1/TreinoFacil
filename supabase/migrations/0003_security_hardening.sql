-- ---------------------------------------------------------------------------
-- 0003 — Correções de segurança e conformidade
-- ---------------------------------------------------------------------------

-- LGPD: registro do consentimento para tratamento de dados sensíveis de saúde
-- (art. 11 exige consentimento específico e destacado) e aceite dos termos.
alter table public.users
  add column if not exists health_consent_at timestamptz,
  add column if not exists terms_accepted_at timestamptz;

-- ---------------------------------------------------------------------------
-- 1) CRÍTICO: escalação de privilégio
-- ---------------------------------------------------------------------------
-- A policy "users_own" é `for all ... with check (id = auth.uid())`, que valida
-- apenas a QUEM a linha pertence — não impede o dono de alterar a própria coluna
-- `role`. Qualquer usuário autenticado podia executar
--   update users set role = 'admin' where id = auth.uid()
-- e ganhar o painel /admin (que agrega dados de todos via service role, ignorando
-- RLS) além de escrita em todo o catálogo global.
--
-- Correção: privilégios por COLUNA. O grant a nível de tabela cobre todas as
-- colunas, por isso é preciso revogá-lo antes de liberar apenas as seguras.
-- `email` fica de fora: a fonte de verdade é auth.users e a troca deve passar
-- pelo fluxo de verificação do Supabase Auth. `role` só muda via service role.
revoke update on public.users from authenticated;
grant update (name, whatsapp, health_consent_at, terms_accepted_at)
  on public.users to authenticated;

-- Defesa em profundidade: mesmo que um grant de tabela volte por engano no
-- futuro, o trigger barra a mudança de role vinda de um usuário final.
-- Só bloqueia o contexto `authenticated`; service role e SQL direto (migrations,
-- painel, scripts administrativos) seguem livres.
create or replace function public.prevent_role_change()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role
     and coalesce(
           nullif(current_setting('request.jwt.claims', true), '')::json ->> 'role',
           '') = 'authenticated'
  then
    raise exception 'alteração de role não permitida';
  end if;
  return new;
end;
$$;

drop trigger if exists users_prevent_role_change on public.users;
create trigger users_prevent_role_change
  before update on public.users
  for each row execute function public.prevent_role_change();

-- ---------------------------------------------------------------------------
-- 2) SAÚDE/MENORES: idade mínima 16 anos
-- ---------------------------------------------------------------------------
-- O check anterior aceitava 10 anos. Prescrever treino (incluindo emagrecimento)
-- e coletar dados de saúde de crianças exige consentimento parental específico
-- (LGPD art. 14) e enquadraria o app nas políticas de público infantil das lojas.
alter table public.profiles drop constraint if exists profiles_age_check;
alter table public.profiles add constraint profiles_age_check
  check (age between 16 and 100);
