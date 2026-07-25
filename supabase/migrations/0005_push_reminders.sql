-- ---------------------------------------------------------------------------
-- 0005 — Lembretes de treino (Web Push)
-- ---------------------------------------------------------------------------

-- Preferência de lembrete por usuário (horário local escolhido).
alter table public.users
  add column if not exists reminders_enabled boolean not null default false,
  add column if not exists reminder_hour smallint check (reminder_hour between 0 and 23);

-- O cliente pode ligar/desligar e escolher o horário (grant por coluna — ver 0003).
grant update (reminders_enabled, reminder_hour) on public.users to authenticated;

-- Inscrições de push (uma por dispositivo/navegador).
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;
create policy "push_subs_own" on public.push_subscriptions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index if not exists idx_push_subs_user on public.push_subscriptions(user_id);

-- ---------------------------------------------------------------------------
-- AGENDAMENTO (aplicar manualmente após publicar a Edge Function)
-- ---------------------------------------------------------------------------
-- Requer as extensões pg_cron e pg_net habilitadas no projeto. Roda de hora em
-- hora; a própria função decide quem deve receber (horário local + já treinou).
--
--   select cron.schedule(
--     'treinofacil-reminders', '0 * * * *', $cron$
--     select net.http_post(
--       url := 'https://SEU-REF.functions.supabase.co/send-reminders',
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer SUA-SERVICE-ROLE-KEY'
--       )
--     );
--     $cron$
--   );
