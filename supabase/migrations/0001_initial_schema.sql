-- ============================================================================
-- TreinoFácil — Migration inicial (schema v2)
-- Gerado a partir de docs/02-BANCO-DE-DADOS.md
-- Ordem: extensões → enums → tabelas → índices → funções → RLS → triggers
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
create type user_role          as enum ('user','admin');
create type sex_type           as enum ('male','female','other');
create type experience_level   as enum ('never','up_to_6m','6m_to_2y','over_2y');
create type exercise_level     as enum ('beginner','intermediate','advanced');
create type training_location  as enum ('home','condo','small_gym','full_gym');
create type media_type         as enum ('image','gif','video');
create type muscle_role        as enum ('primary','secondary');
create type workout_source     as enum ('algorithm','manual','admin');
create type restriction_level  as enum ('avoid','caution');
create type photo_angle        as enum ('front','side','back');
create type program_status     as enum ('active','completed','paused');
create type advance_criteria   as enum ('workouts_completed','completion_pct','time_weeks');
create type achievement_criteria as enum
  ('first_workout','consecutive_days','total_workouts','total_volume_kg',
   'load_progress','perfect_month','total_sets','body_weight_change');
create type override_reason    as enum ('equipment','limitation','manual');

-- ---------------------------------------------------------------------------
-- IDENTIDADE
-- ---------------------------------------------------------------------------
create table public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  email      text not null unique,
  whatsapp   text,
  role       user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.goals (
  id          smallint generated always as identity primary key,
  slug        text not null unique,
  name        text not null,
  description text,
  icon        text,
  is_active   boolean not null default true,
  sort_order  smallint not null default 0
);

create table public.profiles (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null unique references public.users(id) on delete cascade,
  sex                    sex_type,
  age                    smallint check (age between 10 and 100),
  height_cm              numeric(5,2) check (height_cm between 100 and 250),
  weight_kg              numeric(5,2) check (weight_kg between 30 and 300),
  goal_id                smallint references public.goals(id),
  experience             experience_level,
  available_days         smallint check (available_days between 2 and 6),
  available_time_minutes smallint check (available_time_minutes in (30,45,60,90)),
  training_location      training_location,
  onboarding_completed   boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- EVOLUÇÃO FÍSICA
-- ---------------------------------------------------------------------------
create table public.body_measurements (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  measured_at  timestamptz not null default now(),
  weight_kg    numeric(5,2),
  height_cm    numeric(5,2),
  waist_cm     numeric(5,2),
  arm_cm       numeric(5,2),
  thigh_cm     numeric(5,2),
  hip_cm       numeric(5,2),
  chest_cm     numeric(5,2),
  body_fat_pct numeric(4,1),
  bmi numeric(4,1) generated always as (
    case when height_cm is not null and height_cm > 0
      then round((weight_kg / ((height_cm/100.0)*(height_cm/100.0)))::numeric, 1)
    end
  ) stored,
  notes        text,
  created_at   timestamptz not null default now()
);

create table public.progress_photos (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  measurement_id uuid references public.body_measurements(id) on delete set null,
  url            text not null,
  storage_path   text,
  angle          photo_angle,
  taken_at       timestamptz not null default now(),
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- LIMITAÇÕES
-- ---------------------------------------------------------------------------
create table public.limitations (
  id          smallint generated always as identity primary key,
  slug        text not null unique,
  name        text not null,
  description text,
  category    text,
  is_active   boolean not null default true
);

create table public.user_limitations (
  user_id       uuid not null references public.users(id) on delete cascade,
  limitation_id smallint not null references public.limitations(id) on delete cascade,
  notes         text,
  created_at    timestamptz not null default now(),
  primary key (user_id, limitation_id)
);

-- ---------------------------------------------------------------------------
-- EQUIPAMENTOS
-- ---------------------------------------------------------------------------
create table public.equipments (
  id          smallint generated always as identity primary key,
  slug        text not null unique,
  name        text not null,
  description text,
  category    text
);

create table public.user_equipments (
  user_id      uuid not null references public.users(id) on delete cascade,
  equipment_id smallint not null references public.equipments(id) on delete cascade,
  primary key (user_id, equipment_id)
);

-- ---------------------------------------------------------------------------
-- CATÁLOGO DE EXERCÍCIOS
-- ---------------------------------------------------------------------------
create table public.exercise_categories (
  id          smallint generated always as identity primary key,
  slug        text not null unique,
  name        text not null,
  description text
);

create table public.muscle_groups (
  id         smallint generated always as identity primary key,
  slug       text not null unique,
  name       text not null,
  parent_id  smallint references public.muscle_groups(id),
  created_at timestamptz not null default now()
);

create table public.exercises (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null,
  slug                    text not null unique,
  description             text,
  category_id             smallint references public.exercise_categories(id),
  primary_muscle_group_id smallint references public.muscle_groups(id),
  equipment_id            smallint references public.equipments(id),
  level                   exercise_level not null default 'beginner',
  execution               text,
  breathing               text,
  common_mistakes         text,
  tips                    text,
  is_active               boolean not null default true,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create table public.exercise_muscle_groups (
  exercise_id     uuid not null references public.exercises(id) on delete cascade,
  muscle_group_id smallint not null references public.muscle_groups(id) on delete cascade,
  role            muscle_role not null default 'secondary',
  primary key (exercise_id, muscle_group_id)
);

-- fonte de verdade do matching de equipamento (todos is_required devem ser possuídos)
create table public.exercise_equipments (
  exercise_id  uuid not null references public.exercises(id) on delete cascade,
  equipment_id smallint not null references public.equipments(id) on delete cascade,
  is_required  boolean not null default true,
  primary key (exercise_id, equipment_id)
);

-- contraindicações por limitação
create table public.exercise_limitations (
  exercise_id   uuid not null references public.exercises(id) on delete cascade,
  limitation_id smallint not null references public.limitations(id) on delete cascade,
  restriction   restriction_level not null default 'avoid',
  primary key (exercise_id, limitation_id)
);

create table public.exercise_media (
  id           uuid primary key default gen_random_uuid(),
  exercise_id  uuid not null references public.exercises(id) on delete cascade,
  type         media_type not null,
  url          text not null,
  storage_path text,
  is_primary   boolean not null default false,
  position     smallint not null default 0,
  created_at   timestamptz not null default now()
);

create table public.user_favorite_exercises (
  user_id     uuid not null references public.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

-- ---------------------------------------------------------------------------
-- FICHAS (admin)
-- ---------------------------------------------------------------------------
create table public.workout_templates (
  id                       uuid primary key default gen_random_uuid(),
  name                     text not null,
  description              text,
  goal_id                  smallint not null references public.goals(id),
  experience               exercise_level not null,
  days_per_week            smallint not null check (days_per_week between 2 and 6),
  session_duration_minutes smallint not null check (session_duration_minutes in (30,45,60,90)),
  min_location             training_location not null default 'home',
  split_type               text,
  priority                 smallint not null default 0,
  is_active                boolean not null default true,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create table public.workout_days (
  id                         uuid primary key default gen_random_uuid(),
  template_id                uuid not null references public.workout_templates(id) on delete cascade,
  day_index                  smallint not null,
  name                       text not null,
  focus                      text,
  estimated_duration_minutes smallint,
  created_at                 timestamptz not null default now(),
  unique (template_id, day_index)
);

create table public.workout_exercises (
  id             uuid primary key default gen_random_uuid(),
  workout_day_id uuid not null references public.workout_days(id) on delete cascade,
  exercise_id    uuid not null references public.exercises(id),
  position       smallint not null,
  sets           smallint not null,
  reps           text not null,
  rest_seconds   smallint not null default 60,
  notes          text,
  created_at     timestamptz not null default now(),
  unique (workout_day_id, position)
);

-- ---------------------------------------------------------------------------
-- PROGRAMAS (evolução automática)
-- ---------------------------------------------------------------------------
create table public.programs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  goal_id     smallint not null references public.goals(id),
  experience  exercise_level not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.program_phases (
  id               uuid primary key default gen_random_uuid(),
  program_id       uuid not null references public.programs(id) on delete cascade,
  phase_index      smallint not null,
  name             text not null,
  template_id      uuid not null references public.workout_templates(id),
  duration_weeks   smallint,
  advance_criteria advance_criteria not null default 'workouts_completed',
  advance_threshold numeric not null,
  created_at       timestamptz not null default now(),
  unique (program_id, phase_index)
);

create table public.user_programs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  program_id       uuid not null references public.programs(id),
  current_phase_id uuid references public.program_phases(id),
  status           program_status not null default 'active',
  is_active        boolean not null default true,
  started_at       timestamptz not null default now(),
  phase_started_at timestamptz not null default now(),
  created_at       timestamptz not null default now()
);
create unique index uniq_active_user_program on public.user_programs(user_id) where is_active;

-- ---------------------------------------------------------------------------
-- ATRIBUIÇÃO & PERSONALIZAÇÃO
-- ---------------------------------------------------------------------------
create table public.user_workouts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  template_id      uuid not null references public.workout_templates(id),
  user_program_id  uuid references public.user_programs(id),
  program_phase_id uuid references public.program_phases(id),
  source           workout_source not null default 'algorithm',
  is_active        boolean not null default true,
  assigned_at      timestamptz not null default now(),
  created_at       timestamptz not null default now()
);
create unique index uniq_active_user_workout on public.user_workouts(user_id) where is_active;

create table public.user_workout_overrides (
  id                     uuid primary key default gen_random_uuid(),
  user_workout_id        uuid not null references public.user_workouts(id) on delete cascade,
  workout_exercise_id    uuid not null references public.workout_exercises(id) on delete cascade,
  substitute_exercise_id uuid references public.exercises(id),
  reason                 override_reason not null,
  created_at             timestamptz not null default now(),
  unique (user_workout_id, workout_exercise_id)
);

-- ---------------------------------------------------------------------------
-- EXECUÇÃO / PROGRESSO / ESTATÍSTICAS
-- ---------------------------------------------------------------------------
create table public.completed_workouts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  user_workout_id  uuid not null references public.user_workouts(id) on delete cascade,
  workout_day_id   uuid not null references public.workout_days(id),
  started_at       timestamptz,
  completed_at     timestamptz not null default now(),
  duration_seconds integer,
  total_volume     numeric(10,2),
  notes            text,
  created_at       timestamptz not null default now()
);

create table public.user_progress (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.users(id) on delete cascade,
  completed_workout_id uuid references public.completed_workouts(id) on delete cascade,
  workout_exercise_id  uuid references public.workout_exercises(id),
  exercise_id          uuid not null references public.exercises(id),
  set_number           smallint not null,
  reps_done            smallint,
  weight_kg            numeric(6,2),
  rest_seconds         smallint,
  notes                text,
  performed_at         timestamptz not null default now(),
  created_at           timestamptz not null default now()
);

create table public.exercise_progress (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.users(id) on delete cascade,
  exercise_id          uuid not null references public.exercises(id),
  completed_workout_id uuid references public.completed_workouts(id) on delete cascade,
  performed_on         date not null,
  top_weight_kg        numeric(6,2),
  total_sets           smallint,
  total_reps           smallint,
  total_volume         numeric(10,2),
  best_e1rm            numeric(6,2),
  created_at           timestamptz not null default now(),
  unique (user_id, exercise_id, completed_workout_id)
);

create table public.user_stats (
  user_id                uuid primary key references public.users(id) on delete cascade,
  total_workouts         int not null default 0,
  total_sets             int not null default 0,
  total_reps             bigint not null default 0,
  total_volume_kg        numeric(14,2) not null default 0,
  total_duration_seconds bigint not null default 0,
  current_streak         smallint not null default 0,
  longest_streak         smallint not null default 0,
  first_workout_at       timestamptz,
  last_workout_at        timestamptz,
  updated_at             timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- GAMIFICAÇÃO
-- ---------------------------------------------------------------------------
create table public.achievements (
  id          smallint generated always as identity primary key,
  slug        text not null unique,
  name        text not null,
  description text,
  icon        text,
  criteria    achievement_criteria not null,
  threshold   numeric not null default 1,
  tier        smallint not null default 1,
  sort_order  smallint not null default 0,
  is_active   boolean not null default true
);

create table public.user_achievements (
  user_id        uuid not null references public.users(id) on delete cascade,
  achievement_id smallint not null references public.achievements(id) on delete cascade,
  unlocked_at    timestamptz not null default now(),
  progress       numeric,
  primary key (user_id, achievement_id)
);

-- ---------------------------------------------------------------------------
-- ANALYTICS (stream append-only)
-- ---------------------------------------------------------------------------
create table public.app_events (
  id         bigint generated always as identity primary key,
  user_id    uuid references public.users(id) on delete set null,
  type       text not null,
  payload    jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ÍNDICES
-- ---------------------------------------------------------------------------
create index idx_exercises_muscle  on public.exercises(primary_muscle_group_id);
create index idx_exercises_equip   on public.exercises(equipment_id);
create index idx_exercises_active  on public.exercises(is_active);
create index idx_templates_match   on public.workout_templates(goal_id, experience, days_per_week) where is_active;
create index idx_days_template     on public.workout_days(template_id);
create index idx_wex_day           on public.workout_exercises(workout_day_id);
create index idx_completed_user    on public.completed_workouts(user_id, completed_at desc);
create index idx_progress_user_ex  on public.user_progress(user_id, exercise_id, performed_at desc);
create index idx_bm_user           on public.body_measurements(user_id, measured_at desc);
create index idx_exlim_lim         on public.exercise_limitations(limitation_id);
create index idx_exeq_eq           on public.exercise_equipments(equipment_id);
create index idx_ueq_user          on public.user_equipments(user_id);
create index idx_fav_user          on public.user_favorite_exercises(user_id);
create index idx_exprog_user_ex    on public.exercise_progress(user_id, exercise_id, performed_on desc);
create index idx_overrides_uw      on public.user_workout_overrides(user_workout_id);
create index idx_phases_program    on public.program_phases(program_id, phase_index);
create index idx_events_type_time  on public.app_events(type, created_at desc);
create index idx_events_user       on public.app_events(user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- FUNÇÕES
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- cria linhas de suporte quando um usuário se cadastra no Supabase Auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, name, email, whatsapp)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'whatsapp'
  );
  insert into public.profiles (user_id) values (new.id);
  insert into public.user_stats (user_id) values (new.id);
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
-- 1) habilita RLS em todas as tabelas public
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public'
  loop execute format('alter table public.%I enable row level security', t);
  end loop;
end$$;

-- 2) tabela users: dono via coluna id
create policy "users_own" on public.users
  for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- 3) tabelas de dono via coluna user_id
do $$
declare t text;
declare owner_tables text[] := array[
  'profiles','body_measurements','progress_photos','user_limitations',
  'user_equipments','user_favorite_exercises','user_programs','user_workouts',
  'completed_workouts','user_progress','exercise_progress','user_stats','user_achievements'
];
begin
  foreach t in array owner_tables loop
    execute format(
      'create policy %I on public.%I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t || '_own', t);
  end loop;
end$$;

-- 4) user_workout_overrides: dono via join em user_workouts
create policy "uwo_own" on public.user_workout_overrides
  for all to authenticated
  using (exists (select 1 from public.user_workouts uw
                 where uw.id = user_workout_id and uw.user_id = auth.uid()))
  with check (exists (select 1 from public.user_workouts uw
                      where uw.id = user_workout_id and uw.user_id = auth.uid()));

-- 5) catálogo: leitura por autenticado, escrita só admin
do $$
declare t text;
declare catalog_tables text[] := array[
  'goals','limitations','exercise_limitations','exercise_categories','muscle_groups',
  'equipments','exercise_equipments','exercises','exercise_muscle_groups','exercise_media',
  'workout_templates','workout_days','workout_exercises','programs','program_phases','achievements'
];
begin
  foreach t in array catalog_tables loop
    execute format('create policy %I on public.%I for select to authenticated using (true)',
                   t || '_read', t);
    execute format('create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
                   t || '_admin', t);
  end loop;
end$$;

-- app_events: sem policy → sem acesso via anon/authenticated (apenas service role / analytics).

-- ---------------------------------------------------------------------------
-- TRIGGERS
-- ---------------------------------------------------------------------------
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger set_users_updated_at      before update on public.users             for each row execute function public.set_updated_at();
create trigger set_profiles_updated_at   before update on public.profiles          for each row execute function public.set_updated_at();
create trigger set_exercises_updated_at  before update on public.exercises         for each row execute function public.set_updated_at();
create trigger set_templates_updated_at  before update on public.workout_templates for each row execute function public.set_updated_at();
create trigger set_programs_updated_at   before update on public.programs          for each row execute function public.set_updated_at();
