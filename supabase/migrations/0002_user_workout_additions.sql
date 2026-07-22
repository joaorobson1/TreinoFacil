-- ============================================================================
-- TreinoFácil — Migration 0002: exercícios adicionados pelo usuário à ficha
-- Permite ao usuário incluir exercícios extras em um dia da sua ficha ativa,
-- além dos que vêm do template (que já podem ser substituídos/removidos por
-- user_workout_overrides).
-- ============================================================================

create table if not exists public.user_workout_additions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  user_workout_id uuid not null references public.user_workouts(id) on delete cascade,
  workout_day_id  uuid not null references public.workout_days(id) on delete cascade,
  exercise_id     uuid not null references public.exercises(id),
  sets            smallint not null default 3,
  reps            text not null default '12',
  rest_seconds    smallint not null default 60,
  created_at      timestamptz not null default now()
);

create index if not exists idx_uwa_day
  on public.user_workout_additions(user_workout_id, workout_day_id);

alter table public.user_workout_additions enable row level security;

create policy "uwa_own" on public.user_workout_additions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
