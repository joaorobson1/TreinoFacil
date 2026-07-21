# GymGuide — FASE 1 · Modelagem do Banco de Dados (v2)

> PostgreSQL / Supabase. DDL abaixo é o **modelo** desta fase; a migration real entra na FASE 2.
> **v2** incorpora: evolução física, novos objetivos, limitações, equipamentos por usuário, favoritos, pipeline Selector/Validator/Generator, progressão de exercícios, programas com evolução automática, gamificação, estatísticas e analytics de admin.

---

## 1. Mapa de tabelas (por domínio)

```
IDENTIDADE          users · profiles · goals
EVOLUÇÃO FÍSICA     body_measurements · progress_photos
LIMITAÇÕES          limitations · user_limitations · exercise_limitations
EQUIPAMENTOS        equipments · user_equipments · exercise_equipments
CATÁLOGO            exercise_categories · muscle_groups · exercises
                    exercise_muscle_groups · exercise_media
FAVORITOS           user_favorite_exercises
FICHAS (admin)      workout_templates · workout_days · workout_exercises
PROGRAMAS           programs · program_phases · user_programs
ATRIBUIÇÃO          user_workouts · user_workout_overrides   (personalização do Generator)
EXECUÇÃO            completed_workouts · user_progress · exercise_progress
ESTATÍSTICAS        user_stats
GAMIFICAÇÃO         achievements · user_achievements
ANALYTICS           app_events (+ views de relatório)
```

### O que mudou em relação à v1
| Mudança | Motivo (requisito) |
|---|---|
| `body_weight_logs` → **`body_measurements`** (peso + circunferências + IMC gerado) + **`progress_photos`** | (1) Evolução física completa |
| `goals` continua **data-driven** — novos objetivos entram por seed | (2) Novos objetivos sem alterar código |
| **`limitations` · `user_limitations` · `exercise_limitations`** | (3) Limitações influenciam a seleção |
| **`user_equipments`** (o que o usuário tem) + **`exercise_equipments`** (o que o exercício exige) | (4) Equipamentos reais do usuário |
| **`user_favorite_exercises`** | (5) Favoritos |
| **`user_workout_overrides`** (substituições) | (6) WorkoutGenerator |
| **`exercise_progress`** (rollup por exercício/sessão) | (7) Progressão dos exercícios |
| **`user_stats`** (agregados denormalizados) | (8) Dashboard completo |
| **`achievements` · `user_achievements`** | (9) Gamificação |
| **`programs` · `program_phases` · `user_programs`** + colunas em `user_workouts` | (10) Evolução automática |
| **`app_events`** + views | (11) Analytics de admin extensível |

---

## 2. DDL — Enums

```sql
create extension if not exists "pgcrypto";

-- núcleo (v1)
create type user_role         as enum ('user','admin');
create type sex_type          as enum ('male','female','other');
create type experience_level  as enum ('never','up_to_6m','6m_to_2y','over_2y');
create type exercise_level    as enum ('beginner','intermediate','advanced');
create type training_location as enum ('home','condo','small_gym','full_gym'); -- ordem = capacidade
create type media_type        as enum ('image','gif','video');
create type muscle_role       as enum ('primary','secondary');
create type workout_source    as enum ('algorithm','manual','admin');

-- v2
create type restriction_level    as enum ('avoid','caution');      -- exercise_limitations
create type photo_angle          as enum ('front','side','back');  -- progress_photos
create type program_status       as enum ('active','completed','paused');
create type advance_criteria     as enum ('workouts_completed','completion_pct','time_weeks');
create type achievement_criteria as enum
  ('first_workout','consecutive_days','total_workouts','total_volume_kg',
   'load_progress','perfect_month','total_sets','body_weight_change');
create type override_reason      as enum ('equipment','limitation','manual');
```

## 3. DDL — Identidade

```sql
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null, email text not null unique, whatsapp text,
  role user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.goals (
  id smallint generated always as identity primary key,
  slug text not null unique,   -- emagrecer|hipertrofia|definicao|condicionamento|saude
                               -- |ganho_forca|mobilidade|reabilitacao|performance_esportiva
  name text not null, description text, icon text,
  is_active boolean not null default true,
  sort_order smallint not null default 0
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  sex sex_type,
  age smallint check (age between 10 and 100),
  height_cm numeric(5,2) check (height_cm between 100 and 250),
  weight_kg numeric(5,2) check (weight_kg between 30 and 300),   -- peso INICIAL (baseline)
  goal_id smallint references public.goals(id),
  experience experience_level,
  available_days smallint check (available_days between 2 and 6),
  available_time_minutes smallint check (available_time_minutes in (30,45,60,90)),
  training_location training_location,   -- PRESET que semeia user_equipments; refinável
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## 4. DDL — Evolução física (req. 1)

```sql
create table public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  measured_at  timestamptz not null default now(),
  weight_kg    numeric(5,2),
  height_cm    numeric(5,2),            -- copiado do profile p/ IMC histórico correto
  waist_cm     numeric(5,2),            -- circunferência abdominal
  arm_cm       numeric(5,2),            -- braço
  thigh_cm     numeric(5,2),            -- coxa
  hip_cm       numeric(5,2),
  chest_cm     numeric(5,2),
  body_fat_pct numeric(4,1),
  bmi numeric(4,1) generated always as (               -- IMC calculado automaticamente
    case when height_cm is not null and height_cm > 0
      then round((weight_kg / ((height_cm/100.0)*(height_cm/100.0)))::numeric, 1)
    end
  ) stored,
  notes text,
  created_at timestamptz not null default now()
);

create table public.progress_photos (               -- fotos de progresso (opcional)
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  measurement_id uuid references public.body_measurements(id) on delete set null,
  url text not null, storage_path text,
  angle photo_angle,
  taken_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
```

## 5. DDL — Limitações físicas (req. 3)

```sql
create table public.limitations (
  id smallint generated always as identity primary key,
  slug text not null unique,      -- dor_joelho|dor_ombro|hernia_disco|hipertensao|lombar|nenhuma
  name text not null, description text, category text,   -- joint|spine|cardio|other
  is_active boolean not null default true
);

create table public.user_limitations (
  user_id uuid not null references public.users(id) on delete cascade,
  limitation_id smallint not null references public.limitations(id) on delete cascade,
  notes text, created_at timestamptz not null default now(),
  primary key (user_id, limitation_id)
);

-- contraindicações: exercício X é 'avoid'/'caution' para a limitação Y
create table public.exercise_limitations (
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  limitation_id smallint not null references public.limitations(id) on delete cascade,
  restriction restriction_level not null default 'avoid',
  primary key (exercise_id, limitation_id)
);
```

## 6. DDL — Equipamentos (req. 4)

```sql
create table public.equipments (
  id smallint generated always as identity primary key,
  slug text not null unique,      -- barra_olimpica|halteres|smith|leg_press|crossover|polias
                                  -- |banco_inclinado|banco_reto|maquina_supino|maquina_remada
                                  -- |mesa_flexora|cadeira_extensora|peso_corporal|elastico...
  name text not null, description text,
  category text                   -- barra|maquina|livre|cabo|peso_corporal|acessorio
);

-- o que o USUÁRIO tem disponível
create table public.user_equipments (
  user_id uuid not null references public.users(id) on delete cascade,
  equipment_id smallint not null references public.equipments(id) on delete cascade,
  primary key (user_id, equipment_id)
);

-- o que o EXERCÍCIO exige (N:N — supino inclinado c/ halteres = banco_inclinado + halteres)
create table public.exercise_equipments (
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  equipment_id smallint not null references public.equipments(id) on delete cascade,
  is_required boolean not null default true,
  primary key (exercise_id, equipment_id)
);
```

## 7. DDL — Catálogo de exercícios

```sql
create table public.exercise_categories (
  id smallint generated always as identity primary key,
  slug text not null unique, name text not null, description text
);

create table public.muscle_groups (
  id smallint generated always as identity primary key,
  slug text not null unique, name text not null,
  parent_id smallint references public.muscle_groups(id),
  created_at timestamptz not null default now()
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text not null unique, description text,
  category_id smallint references public.exercise_categories(id),
  primary_muscle_group_id smallint references public.muscle_groups(id),
  equipment_id smallint references public.equipments(id),  -- equipamento PRINCIPAL (exibição)
  level exercise_level not null default 'beginner',
  execution text, breathing text, common_mistakes text, tips text,   -- conteúdo rico
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- OBS: a fonte de verdade para MATCHING de equipamento é exercise_equipments (todos is_required).

create table public.exercise_muscle_groups (   -- "Músculos utilizados"
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  muscle_group_id smallint not null references public.muscle_groups(id) on delete cascade,
  role muscle_role not null default 'secondary',
  primary key (exercise_id, muscle_group_id)
);

create table public.exercise_media (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  type media_type not null, url text not null, storage_path text,
  is_primary boolean not null default false, position smallint not null default 0,
  created_at timestamptz not null default now()
);

create table public.user_favorite_exercises (   -- favoritos (req. 5)
  user_id uuid not null references public.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, exercise_id)
);
```

## 8. DDL — Fichas (admin)

```sql
create table public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null, description text,
  goal_id smallint not null references public.goals(id),
  experience exercise_level not null,
  days_per_week smallint not null check (days_per_week between 2 and 6),
  session_duration_minutes smallint not null check (session_duration_minutes in (30,45,60,90)),
  min_location training_location not null default 'home',
  split_type text, priority smallint not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_days (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.workout_templates(id) on delete cascade,
  day_index smallint not null, name text not null, focus text,
  estimated_duration_minutes smallint,
  created_at timestamptz not null default now(),
  unique (template_id, day_index)
);

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_day_id uuid not null references public.workout_days(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  position smallint not null,
  sets smallint not null, reps text not null, rest_seconds smallint not null default 60,
  notes text, created_at timestamptz not null default now(),
  unique (workout_day_id, position)
);
```

## 9. DDL — Programas & evolução automática (req. 10)

```sql
-- um PROGRAMA é uma sequência ordenada de FASES; cada fase aponta p/ uma ficha
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text not null unique, description text,
  goal_id smallint not null references public.goals(id),
  experience exercise_level not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.program_phases (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  phase_index smallint not null,                 -- 1..N (ordem)
  name text not null,                            -- "Fase 1 — Adaptação (Semanas 1–4)"
  template_id uuid not null references public.workout_templates(id),
  duration_weeks smallint,
  advance_criteria advance_criteria not null default 'workouts_completed',
  advance_threshold numeric not null,            -- ex.: 12 treinos | 80(%) | 4(semanas)
  created_at timestamptz not null default now(),
  unique (program_id, phase_index)
);

create table public.user_programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  program_id uuid not null references public.programs(id),
  current_phase_id uuid references public.program_phases(id),
  status program_status not null default 'active',
  is_active boolean not null default true,
  started_at timestamptz not null default now(),
  phase_started_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create unique index uniq_active_user_program
  on public.user_programs(user_id) where is_active;
```

## 10. DDL — Atribuição & personalização (req. 6)

```sql
create table public.user_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  template_id uuid not null references public.workout_templates(id),
  user_program_id uuid references public.user_programs(id),   -- null = ficha avulsa
  program_phase_id uuid references public.program_phases(id),
  source workout_source not null default 'algorithm',
  is_active boolean not null default true,
  assigned_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create unique index uniq_active_user_workout
  on public.user_workouts(user_id) where is_active;

-- substituições do WorkoutGenerator (delta sobre o template; null = exercício removido)
create table public.user_workout_overrides (
  id uuid primary key default gen_random_uuid(),
  user_workout_id uuid not null references public.user_workouts(id) on delete cascade,
  workout_exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  substitute_exercise_id uuid references public.exercises(id),
  reason override_reason not null,
  created_at timestamptz not null default now(),
  unique (user_workout_id, workout_exercise_id)
);
```

## 11. DDL — Execução, progressão & estatísticas (req. 7, 8)

```sql
create table public.completed_workouts (
  id uuid primary key default gen_random_uuid(),   -- gerado no client (idempotência offline)
  user_id uuid not null references public.users(id) on delete cascade,
  user_workout_id uuid not null references public.user_workouts(id) on delete cascade,
  workout_day_id uuid not null references public.workout_days(id),
  started_at timestamptz, completed_at timestamptz not null default now(),
  duration_seconds integer, total_volume numeric(10,2), notes text,
  created_at timestamptz not null default now()
);

create table public.user_progress (             -- log por SÉRIE (bruto)
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  completed_workout_id uuid references public.completed_workouts(id) on delete cascade,
  workout_exercise_id uuid references public.workout_exercises(id),
  exercise_id uuid not null references public.exercises(id),
  set_number smallint not null, reps_done smallint, weight_kg numeric(6,2),
  rest_seconds smallint, notes text,
  performed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- rollup por exercício/sessão p/ GRÁFICOS de evolução (req. 7). Mantido no CompleteWorkout.
create table public.exercise_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  completed_workout_id uuid references public.completed_workouts(id) on delete cascade,
  performed_on date not null,
  top_weight_kg numeric(6,2),      -- maior carga da sessão
  total_sets smallint, total_reps smallint, total_volume numeric(10,2),
  best_e1rm numeric(6,2),          -- 1RM estimado (Epley) p/ curva de força
  created_at timestamptz not null default now(),
  unique (user_id, exercise_id, completed_workout_id)
);

-- agregados denormalizados p/ Dashboard (req. 8). Atualizado no CompleteWorkout (StatsAggregator).
create table public.user_stats (
  user_id uuid primary key references public.users(id) on delete cascade,
  total_workouts int not null default 0,
  total_sets int not null default 0,
  total_reps bigint not null default 0,
  total_volume_kg numeric(14,2) not null default 0,
  total_duration_seconds bigint not null default 0,
  current_streak smallint not null default 0,
  longest_streak smallint not null default 0,
  first_workout_at timestamptz, last_workout_at timestamptz,
  updated_at timestamptz not null default now()
);
-- "Peso perdido/ganho" = (última body_measurements.weight_kg) − profiles.weight_kg (baseline).
```

## 12. DDL — Gamificação (req. 9)

```sql
create table public.achievements (
  id smallint generated always as identity primary key,
  slug text not null unique, name text not null, description text, icon text,
  criteria achievement_criteria not null,   -- tipo do critério (data-driven)
  threshold numeric not null default 1,      -- valor-alvo (ex.: 7, 30, 100, 1000, 10000)
  tier smallint not null default 1,
  sort_order smallint not null default 0,
  is_active boolean not null default true
);
-- Exemplos (seed): Primeiro treino(first_workout,1) · 7 dias(consecutive_days,7)
--  30 dias(consecutive_days,30) · 100 treinos(total_workouts,100)
--  1 tonelada(total_volume_kg,1000) · 10 toneladas(total_volume_kg,10000)
--  Primeira evolução de carga(load_progress,1) · Mês sem faltar(perfect_month,1)

create table public.user_achievements (
  user_id uuid not null references public.users(id) on delete cascade,
  achievement_id smallint not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  progress numeric,                          -- opcional: barra "62/100 treinos"
  primary key (user_id, achievement_id)
);
```

## 13. DDL — Analytics de admin (req. 11)

```sql
-- stream append-only: novas métricas derivam de eventos SEM alterar tabelas existentes
create table public.app_events (
  id bigint generated always as identity primary key,
  user_id uuid references public.users(id) on delete set null,
  type text not null,        -- signup|onboarding_done|workout_completed|achievement_unlocked
                             -- |phase_advanced|template_assigned|exercise_logged...
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index idx_events_type_time on public.app_events(type, created_at desc);
create index idx_events_user      on public.app_events(user_id, created_at desc);
```

Métricas do painel = **views** (derivadas das tabelas normalizadas; adicionar métrica = nova view, zero refactor). Exemplos:

```sql
create view admin_kpi_users as
select
  (select count(*) from public.users) as total_users,
  (select count(distinct user_id) from public.completed_workouts
     where completed_at > now() - interval '7 days')  as active_7d,
  (select count(distinct user_id) from public.completed_workouts
     where completed_at > now() - interval '30 days') as active_30d,
  (select count(*) from public.completed_workouts)     as total_completed_workouts;

create view admin_exercise_usage as       -- exercícios mais utilizados
select e.id, e.name, count(up.id) as times_logged
from public.exercises e
left join public.user_progress up on up.exercise_id = e.id
group by e.id, e.name order by times_logged desc;

create view admin_template_assignments as -- fichas mais atribuídas
select t.id, t.name, count(uw.id) as assignments
from public.workout_templates t
left join public.user_workouts uw on uw.template_id = t.id
group by t.id, t.name order by assignments desc;
```
Retenção, frequência média e evolução da base seguem o mesmo padrão (views sobre `completed_workouts`/`users`/`app_events`).

## 14. Índices adicionais (v2)

```sql
create index idx_bm_user        on public.body_measurements(user_id, measured_at desc);
create index idx_exlim_lim      on public.exercise_limitations(limitation_id);
create index idx_exeq_eq        on public.exercise_equipments(equipment_id);
create index idx_ueq_user       on public.user_equipments(user_id);
create index idx_fav_user       on public.user_favorite_exercises(user_id);
create index idx_exprog_user_ex on public.exercise_progress(user_id, exercise_id, performed_on desc);
create index idx_uw_active      on public.user_workouts(user_id) where is_active;
create index idx_overrides_uw   on public.user_workout_overrides(user_workout_id);
create index idx_phases_program on public.program_phases(program_id, phase_index);
-- + índices da v1 (templates_match, completed_user, progress_user_ex, etc.)
```

---

## 15. RLS (atualizado)

| Classe | Tabelas | Regra |
|---|---|---|
| **Dono** | `users`, `profiles`, `body_measurements`, `progress_photos`, `user_limitations`, `user_equipments`, `user_favorite_exercises`, `user_workouts`, `user_workout_overrides`, `user_programs`, `completed_workouts`, `user_progress`, `exercise_progress`, `user_stats`, `user_achievements` | `user_id = auth.uid()` em todas as operações |
| **Catálogo (leitura autenticada / escrita admin)** | `goals`, `limitations`, `exercise_limitations`, `equipments`, `exercise_equipments`, `exercise_categories`, `muscle_groups`, `exercises`, `exercise_muscle_groups`, `exercise_media`, `workout_templates`, `workout_days`, `workout_exercises`, `programs`, `program_phases`, `achievements` | `select` p/ autenticado; escrita só `role='admin'` |
| **Servidor** | `app_events`, views `admin_*` | escrita via service-role/trigger; leitura das views só admin |

**Triggers principais:**
- `auth.users` insert → cria `public.users` + `profiles` vazio + `user_stats` zerado.
- `completed_workouts` insert → atualiza `user_stats`, gera `exercise_progress`, avalia `user_achievements` e progressão de `user_programs` (ou feito no use case `CompleteWorkout` — decisão na FASE 2; trigger garante consistência mesmo em escrita direta).

## 16. Seed & invariantes de cobertura

- **Objetivos (req. 2):** seed dos 9 → `emagrecer, hipertrofia, definicao, condicionamento, saude, ganho_forca, mobilidade, reabilitacao, performance_esportiva`. Novos objetivos = nova linha, **sem código**.
- **Limitação "nenhuma"** sempre presente (default do onboarding).
- **Equipamentos:** seed da lista completa + `peso_corporal` (sempre disponível a todos → garante exercícios de fallback sem equipamento).
- **Invariante de ficha garantida:** para cada `goal`, ≥1 `workout_template` `beginner / 3 dias / home / 45min` composta **apenas de exercícios com `exercise_equipments` = {peso_corporal}** e **sem** `exercise_limitations` de limitações comuns → o pipeline sempre encontra e valida uma ficha, mesmo para usuário sem equipamento e com limitações.
