# TreinoFácil — FASE 1 · Fluxos, Casos de Uso e Regras de Negócio (v2)

> **v2** substitui o `WorkoutMatcher` único pelo pipeline **Selector → Validator → Generator**, e adiciona progressão automática, gamificação, evolução física, dashboard completo e analytics de admin. **Zero IA — tudo é regra + banco.**

---

## 1. Fluxo de telas (macro)

```
Splash ─▶ [tem sessão?]
   ├─ não ─▶ Login ⇄ Cadastro ─▶ Onboarding ─▶ [PIPELINE atribui ficha] ─▶ Dashboard
   └─ sim ─▶ [onboarding_completed?] ─ não ─▶ Onboarding
                                     └ sim ─▶ Dashboard

Dashboard ─▶ Treino de hoje ─▶ Sessão ─▶ Exercício (full) ─▶ Concluir ─▶ Descanso ─▶ próximo
                                                              └(último)─▶ Resumo ─▶ [pós-treino] ─▶ Dashboard
Dashboard ─▶ Histórico | Progresso/Evolução | Programa | Conquistas | Perfil
/admin (role=admin) ─▶ Dashboard analítico + CRUD catálogo/fichas/programas
```

### Onboarding (etapas — atualizado)
1. Sexo · Idade · Altura · Peso  → cria baseline em `profiles` + 1ª `body_measurements`
2. Objetivo (9 opções, data-driven) → `goals`
3. Experiência (4 níveis)
4. Dias disponíveis (2–6)
5. Tempo disponível (30/45/60/90)
6. **Onde treina** (preset) → semeia `user_equipments`
7. **Equipamentos disponíveis** (refino do preset — multiselect) → `user_equipments`
8. **Limitações físicas** (multiselect; "Nenhuma" default) → `user_limitations`

Etapas 7–8 são as novas; o preset da etapa 6 pré-marca os equipamentos típicos e o usuário ajusta.

---

## 2. PIPELINE de atribuição da ficha (req. 6 — sem IA)

Substitui o antigo `WorkoutMatcher`. Três serviços puros, encadeados. Entrada = `profile` + contexto (`user_equipments`, `user_limitations`). Saída = `user_workouts` ativo (+ `user_workout_overrides`).

```
selectAndAssign(user):
  ctx = { equipments: user_equipments, limitations: user_limitations,
          level: mapExperience(profile.experience), goal: profile.goal_id,
          days: profile.available_days, time: profile.available_time_minutes,
          location: profile.training_location }

  # ─────────────── 1) WorkoutSelector ───────────────
  # prioriza PROGRAMA (evolução automática); cai p/ ficha avulsa se não houver
  candidatos = SELECT programas/templates WHERE
        is_active AND goal_id = ctx.goal
        AND days_per_week <= ctx.days            # nunca exige mais dias
        AND session_duration_minutes <= ctx.time # nunca exige mais tempo
  # AMBIENTE não é filtro rígido: uma ficha de ambiente mais equipado ainda pode
  # ser escolhida e ADAPTADA pelo Generator (troca os aparelhos que faltam). A
  # viabilidade real é por equipamento (§2), com teto de adaptação (MAX_ADAPT ~50%).
  score(t) = expMatch(t,ctx)*100 + daysFit + timeFit + locFit(|Δambiente|) + t.priority
  ordena candidatos por score desc

  # ─────────────── 2) WorkoutValidator ───────────────
  para cada candidato (em ordem de score):
     report = validate(template, ctx):
        para cada workout_exercise wx:
           incompat = falta equipamento exigido (exercise_equipments \ ctx.equipments)
                   OU contraindicado ('avoid' em exercise_limitations ∩ ctx.limitations)
           se incompat: precisa de substituto (Generator.canSubstitute(wx, ctx))
        viável = nenhum dia fica com < 3 exercícios
                 E (adaptados / total <= MAX_ADAPT_FRACTION, ex. 50%)
     se report.viável: escolhido = candidato; break
  # a invariante de seed (ficha peso_corporal/sem-restrição) garante ≥1 viável
  # (quem só tem peso corporal: fichas de academia estouram o teto → cai no fallback)

  # ─────────────── 3) WorkoutGenerator ───────────────
  overrides = []
  para cada wx incompatível de `escolhido`:
     sub = melhor exercício E' ONDE
             E'.primary_muscle_group_id = wx.exercise.primary_muscle_group_id
         AND E'.level <= ctx.level                         # nunca mais difícil
         AND todos exercise_equipments(E') ⊆ ctx.equipments
         AND E' NÃO tem 'avoid' p/ nenhuma limitação de ctx
         AND E'.is_active
         ordenar por: (é favorito? ) , equipamento idêntico, popularidade, priority
     overrides += override(wx, sub ?? null, reason)        # null = exercício removido

  grava user_workouts(source, program/phase se programa, is_active=true) + overrides
  desativa user_workout anterior (is_active=false)
```

**Garantias:**
- Exercício incompatível **nunca** é atribuído — ou é substituído, ou removido.
- Substituto preserva **grupo muscular** e **dificuldade** (nível ≤ do usuário).
- Se um dia ficar com exercícios de menos após remoções, o Generator completa com exercícios compatíveis do mesmo foco muscular (regra de mínimo por dia).

**Exemplo do brief:** `Hipertrofia + Iniciante + 4 dias`, usuário com _dor no joelho_ e sem leg press →
Selector acha "Hipertrofia Iniciante 4 dias"; Validator marca "Leg Press" (equipamento ausente) e "Agachamento livre" (contraindicado p/ joelho); Generator troca por "Leg press" → "Cadeira extensora leve"/"Ponte de glúteo" e "Agachamento" → variação sem impacto no joelho, mantendo grupo/nível.

---

## 3. Casos de uso (camada application)

| Grupo | Use Cases |
|---|---|
| Auth | `SignUp`, `SignIn`, `SignOut` |
| Onboarding | `SaveOnboardingStep`, `SetUserEquipments`, `SetUserLimitations`, `CompleteOnboarding` → dispara o pipeline |
| Ficha | `AssignWorkout` (Selector+Validator+Generator), `ReassignWorkout` (troca de perfil), `GetTodaysWorkout` (aplica overrides) |
| Sessão | `StartWorkoutSession`, `LogSet`, `CompleteWorkout` (dispara pós-treino) |
| Evolução física | `RecordMeasurement` (IMC auto), `UploadProgressPhoto`, `GetPhysicalEvolution` |
| Progresso exercício | `GetExerciseProgress` (curva de carga/e1RM) |
| Favoritos | `ToggleFavoriteExercise`, `ListFavorites` |
| Programa | `EnrollProgram`, `EvaluateProgression`, `AdvancePhase` |
| Gamificação | `EvaluateAchievements`, `ListAchievements` |
| Dashboard | `GetDashboard` (lê `user_stats` + últimas medições) |
| Histórico | `GetHistory`, `GetWeeklyVolume` |
| Admin | CRUD de exercícios/fichas/programas/grupos/equipamentos/limitações/mídia/conquistas + `GetAdminAnalytics` |

---

## 4. Regras de mapeamento

- **Experiência → nível:** `never|up_to_6m → beginner`, `6m_to_2y → intermediate`, `over_2y → advanced`.
- **Ambiente (capacidade):** `home < condo < small_gym < full_gym`. Não é filtro rígido — o `min_location` da ficha é um **sinal de pontuação** (prefere a ficha do ambiente mais próximo, `|Δ|`) e a compatibilidade real é por **equipamento** + **teto de adaptação**. Assim, um usuário de academia pequena pode receber uma ficha de academia adaptada, e quem só tem peso corporal cai no fallback.
- **Equipamento (req. 4):** exercício é executável se `exercise_equipments(is_required) ⊆ user_equipments`. `peso_corporal` é sempre concedido a todos.
- **Limitação (req. 3):** exercício com `exercise_limitations.restriction = 'avoid'` para qualquer limitação do usuário **nunca** é atribuído; `'caution'` é atribuído com aviso na tela.
- **Descanso:** default de `workout_exercises.rest_seconds`; usuário sobrescreve p/ 60/90/120s.

---

## 5. Progressão automática de programas (req. 10 — sem IA)

Um **programa** é uma sequência de **fases**, cada uma apontando para uma ficha. Ao concluir treinos, o `ProgramProgressionService` avalia o critério da fase atual e avança sozinho.

```
onWorkoutCompleted(user):
  up = user_programs ativo do usuário; se nenhum, retorna
  fase = up.current_phase
  progresso = medir(fase.advance_criteria):
      workouts_completed → nº de completed_workouts desde up.phase_started_at
      completion_pct     → % de dias da fase concluídos no período
      time_weeks         → semanas desde up.phase_started_at
  se progresso >= fase.advance_threshold:
      próxima = program_phases WHERE program_id=up.program_id AND phase_index=fase.phase_index+1
      se próxima existe:
          up.current_phase = próxima ; up.phase_started_at = now()
          ReassignWorkout(user, próxima.template_id)   # re-roda Validator+Generator na nova ficha
          registra app_events('phase_advanced')
      senão:
          up.status = 'completed'                       # programa concluído
```

Exemplo: *Hipertrofia Iniciante* → Fase 1 (Semanas 1–4, `advance_criteria=workouts_completed`, `threshold=12`) → ao concluir 12 treinos, avança para Fase 2 automaticamente, com a nova ficha já validada/personalizada para os equipamentos e limitações do usuário.

---

## 6. Dashboard completo (req. 8) — cálculo dos indicadores

Lidos majoritariamente de `user_stats` (denormalizado, atualizado no pós-treino) → dashboard rápido, sem varrer histórico.

| Indicador | Fonte / cálculo |
|---|---|
| Treino de hoje / próximo | rotação: `(último day_index mod N) + 1` da ficha ativa |
| Dias consecutivos (streak) | `user_stats.current_streak` |
| Maior sequência | `user_stats.longest_streak` |
| Treinos concluídos | `user_stats.total_workouts` |
| Tempo total treinado | `user_stats.total_duration_seconds` |
| Total de séries | `user_stats.total_sets` |
| Total de repetições | `user_stats.total_reps` |
| Volume total movimentado | `user_stats.total_volume_kg` |
| Peso atual | última `body_measurements.weight_kg` |
| Peso perdido/ganho | `peso_atual − profiles.weight_kg` (baseline) |
| IMC atual | última `body_measurements.bmi` (gerado) |
| Objetivo | `goals.name` do perfil |

**StatsAggregator (pós-treino):** incrementa contadores; recalcula `current_streak`/`longest_streak`; grava `first/last_workout_at`.
**Streak:** dias-calendário consecutivos (fuso do usuário) até hoje/ontem com ≥1 `completed_workout`; gap quebra.
**e1RM (curva de força):** Epley `carga × (1 + reps/30)`, gravado em `exercise_progress.best_e1rm`.

---

## 7. Gamificação (req. 9) — avaliação data-driven

`achievements` é **dirigido por dados**: `criteria` (tipo) + `threshold` (alvo). Adicionar conquista = nova linha no seed, sem código.

```
AchievementEvaluator.evaluate(user):   # roda no pós-treino
  stats = user_stats
  para cada a em achievements WHERE is_active AND a.id NOT IN user_achievements(user):
     valor = switch(a.criteria):
        first_workout      → stats.total_workouts
        consecutive_days   → stats.current_streak
        total_workouts     → stats.total_workouts
        total_volume_kg    → stats.total_volume_kg
        total_sets         → stats.total_sets
        load_progress      → nº de exercícios com e1RM crescente (via exercise_progress)
        perfect_month      → treinos em todas as semanas do mês corrente
        body_weight_change → |peso_atual − baseline|
     se valor >= a.threshold:
        insere user_achievements(user, a) ; toast de desbloqueio ; app_events('achievement_unlocked')
```

Seed inicial: Primeiro treino · 7 dias · 30 dias · 100 treinos · 1 tonelada · 10 toneladas · 1ª evolução de carga · 1º mês sem faltar.

---

## 8. Histórico & Evolução física

- **Histórico:** `completed_workouts` (data, duração, volume) · heatmap de calendário · volume semanal (`Σ total_volume` por semana ISO) · dias treinados.
- **Evolução física (req. 1):** série temporal de `body_measurements` (peso, cintura, braço, coxa, IMC) em gráficos + galeria de `progress_photos` por ângulo/data (comparativo antes/depois).
- **Evolução por exercício (req. 7):** `exercise_progress` → curva de carga máxima e e1RM por exercício ao longo do tempo.

---

## 9. Painel administrativo (req. 11) — dashboard analítico

CRUD (exercícios, fichas, **programas/fases**, grupos musculares, equipamentos, **limitações**, mídia, **conquistas**) **+** dashboard de métricas via **views** `admin_*` e `app_events`:

| Métrica | Origem |
|---|---|
| Usuários cadastrados | `admin_kpi_users.total_users` |
| Usuários ativos (7d/30d) | `admin_kpi_users.active_7d/30d` |
| Treinos concluídos | `admin_kpi_users.total_completed_workouts` |
| Exercícios mais utilizados | view `admin_exercise_usage` |
| Fichas mais atribuídas | view `admin_template_assignments` |
| Frequência média | `completed_workouts` / usuários ativos por período |
| Retenção (cohorts) | `app_events('signup')` × atividade posterior |
| Evolução da base | `users.created_at` acumulado por mês |

**Extensibilidade:** novas métricas = nova **view** ou nova query sobre `app_events` — nenhuma alteração nas tabelas existentes (requisito de "sem refatoração estrutural").

---

## 10. Matriz de permissões (resumo)

| Ação | user | admin |
|---|:--:|:--:|
| Próprios: perfil, medições, fotos, limitações, equipamentos, favoritos, treinos, progresso, programa, conquistas | ✅ | ✅ |
| Ler catálogo (exercícios, fichas, programas, conquistas) | ✅ | ✅ |
| CRUD catálogo/fichas/programas/limitações/equipamentos/conquistas/mídia | ❌ | ✅ |
| Dashboard analítico `/admin` (views) | ❌ | ✅ |

Aplicada em **duas camadas**: RLS no Postgres (verdade) + guarda de rota no middleware (UX).
