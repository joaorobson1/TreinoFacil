-- ============================================================================
-- TreinoFácil — Seed de dados de referência (idempotente)
-- Popula tabelas lookup/data-driven. Exercícios, fichas e programas são
-- cadastrados pelo painel admin (FASES 5–6).
-- ============================================================================

-- OBJETIVOS (req. 2 — 9 objetivos) ------------------------------------------
insert into public.goals (slug, name, description, icon, sort_order) values
  ('emagrecer',             'Emagrecer',              'Reduzir gordura corporal',            'flame',       1),
  ('hipertrofia',           'Hipertrofia',            'Ganhar massa muscular',               'dumbbell',    2),
  ('definicao',             'Definição',              'Definir e tonificar',                 'sparkles',    3),
  ('condicionamento',       'Condicionamento',        'Melhorar o preparo físico',           'heart-pulse', 4),
  ('saude',                 'Saúde',                  'Treinar pelo bem-estar',              'leaf',        5),
  ('ganho_forca',           'Ganho de força',         'Aumentar a força máxima',             'dumbbell',    6),
  ('mobilidade',            'Mobilidade',             'Ganhar amplitude e mobilidade',       'move',        7),
  ('reabilitacao',          'Reabilitação',           'Recuperar-se com segurança',          'shield',      8),
  ('performance_esportiva', 'Performance esportiva',  'Render mais no esporte',              'trophy',      9)
on conflict (slug) do nothing;

-- LIMITAÇÕES (req. 3) -------------------------------------------------------
insert into public.limitations (slug, name, category) values
  ('nenhuma',      'Nenhuma',              'none'),
  ('dor_joelho',   'Dor no joelho',        'joint'),
  ('dor_ombro',    'Dor no ombro',         'joint'),
  ('hernia_disco', 'Hérnia de disco',      'spine'),
  ('hipertensao',  'Hipertensão',          'cardio'),
  ('lombar',       'Problemas lombares',   'spine')
on conflict (slug) do nothing;

-- EQUIPAMENTOS (req. 4) -----------------------------------------------------
insert into public.equipments (slug, name, category) values
  ('peso_corporal',     'Peso corporal',       'peso_corporal'),
  ('halteres',          'Halteres',            'livre'),
  ('anilhas',           'Anilhas',             'livre'),
  ('kettlebell',        'Kettlebell',          'livre'),
  ('barra_olimpica',    'Barra olímpica',      'barra'),
  ('smith',             'Smith',               'maquina'),
  ('leg_press',         'Leg press',           'maquina'),
  ('maquina_supino',    'Máquina de supino',   'maquina'),
  ('maquina_remada',    'Máquina de remada',   'maquina'),
  ('mesa_flexora',      'Mesa flexora',        'maquina'),
  ('cadeira_extensora', 'Cadeira extensora',   'maquina'),
  ('crossover',         'Crossover',           'cabo'),
  ('polias',            'Polias',              'cabo'),
  ('banco_reto',        'Banco reto',          'acessorio'),
  ('banco_inclinado',   'Banco inclinado',     'acessorio'),
  ('elastico',          'Elástico',            'acessorio')
on conflict (slug) do nothing;

-- CATEGORIAS DE EXERCÍCIO ---------------------------------------------------
insert into public.exercise_categories (slug, name) values
  ('forca',        'Força'),
  ('cardio',       'Cardio'),
  ('mobilidade',   'Mobilidade'),
  ('alongamento',  'Alongamento')
on conflict (slug) do nothing;

-- GRUPOS MUSCULARES ---------------------------------------------------------
insert into public.muscle_groups (slug, name) values
  ('peito',       'Peito'),
  ('costas',      'Costas'),
  ('ombros',      'Ombros'),
  ('biceps',      'Bíceps'),
  ('triceps',     'Tríceps'),
  ('antebraco',   'Antebraço'),
  ('quadriceps',  'Quadríceps'),
  ('posterior',   'Posteriores de coxa'),
  ('gluteos',     'Glúteos'),
  ('panturrilha', 'Panturrilha'),
  ('abdomen',     'Abdômen')
on conflict (slug) do nothing;

-- CONQUISTAS (req. 9) -------------------------------------------------------
insert into public.achievements (slug, name, description, icon, criteria, threshold, sort_order) values
  ('primeiro_treino', 'Primeiro treino',           'Concluiu o primeiro treino',            'play',       'first_workout',      1,     1),
  ('streak_7',        '7 dias seguidos',           'Treinou 7 dias consecutivos',           'flame',      'consecutive_days',   7,     2),
  ('streak_30',       '30 dias seguidos',          'Treinou 30 dias consecutivos',          'flame',      'consecutive_days',   30,    3),
  ('treinos_100',     '100 treinos',               'Concluiu 100 treinos',                  'medal',      'total_workouts',     100,   4),
  ('tonelada_1',      'Primeira tonelada',         'Movimentou 1.000 kg no total',          'weight',     'total_volume_kg',    1000,  5),
  ('tonelada_10',     '10 toneladas',              'Movimentou 10.000 kg no total',         'weight',     'total_volume_kg',    10000, 6),
  ('evolucao_carga',  'Primeira evolução de carga','Aumentou a carga em um exercício',      'trending-up','load_progress',      1,     7),
  ('mes_perfeito',    'Mês sem faltar',            'Treinou em todas as semanas do mês',    'calendar',   'perfect_month',      1,     8)
on conflict (slug) do nothing;
