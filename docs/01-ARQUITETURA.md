# GymGuide — FASE 1 · Arquitetura, Estrutura de Pastas e Design System

> Documento de arquitetura. **Nenhuma dependência é instalada nesta fase.** Este arquivo é o contrato técnico que guia as FASES 2–7.

---

## 1. Princípios da arquitetura

O GymGuide é um **PWA comercial** (Play Store / App Store via wrapper PWA), então a arquitetura precisa ser:

- **Testável e independente de framework** no núcleo de regras de negócio (o algoritmo de seleção de ficha não pode depender do Next nem do Supabase).
- **Barata de manter** — zero IA, toda personalização é regra + banco.
- **Escalável** — novos objetivos, níveis e fichas entram só com _seed_ de dados, sem tocar em código.
- **Offline-first** para consulta de treinos já baixados.

Adotamos **Clean Architecture pragmática** adaptada ao App Router do Next 15. Não é hexagonal purista (seria _over-engineering_ para um PWA); é uma separação em 4 camadas com dependências apontando sempre para dentro:

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION  (React Server/Client Components, Tailwind,     │
│                 shadcn/ui, Framer Motion, hooks)              │
│        ↓ chama                                                │
│  INTERFACE ADAPTERS  (Server Actions + Route Handlers)       │
│        ↓ chama                                                │
│  APPLICATION  (Use Cases + Services: WorkoutMatcher, DTOs)   │  ← framework-agnostic
│        ↓ depende de interfaces (ports)                        │
│  DOMAIN  (Entities, Enums, Value Objects, Repository Ports)  │  ← framework-agnostic
└─────────────────────────────────────────────────────────────┘
        ↑ implementado por
  INFRASTRUCTURE  (Supabase clients, Repositories, Storage)     │  ← detalhe substituível
```

**Regra de ouro:** `core/` (domain + application) **nunca** importa `next`, `react` ou `@supabase/*`. Ele conhece apenas _interfaces_ (ports). A infra implementa essas interfaces. Isso permite testar o `WorkoutMatcher` com um repositório fake, sem banco.

### Por que Server Actions como camada de adaptação?

No Next 15 as **Server Actions** substituem uma API REST tradicional para as mutações do próprio app: são type-safe ponta a ponta, rodam no servidor com o Supabase client seguro (cookies), e a UI as chama como funções. Cada action é **fina** — apenas valida entrada (Zod), instancia o use case com o repositório concreto e retorna um `Result`. Regra de negócio nenhuma mora na action.

Route Handlers (`app/api/*`) ficam reservados para o que precisa de HTTP puro: webhooks, `manifest`, sincronização offline em lote.

---

## 2. Decisões-chave (e o porquê)

| Decisão | Escolha | Justificativa |
|---|---|---|
| Data fetching | **Server Components** buscam via use case → repositório com client server-side | Zero JS de dados no cliente, RLS aplicada, cache do Next |
| Mutações | **Server Actions** finas | Type-safe, seguras, sem boilerplate de API |
| Estado de UI efêmero (cronômetro, sessão em andamento) | **Client Components + Zustand** | Cronômetro e progresso da sessão são estado local, reativo |
| Cache de servidor de dados de catálogo | `unstable_cache` / tags | Exercícios e fichas mudam pouco → revalidação por tag no admin |
| Validação | **Zod** em todo boundary (form → action) | Tipagem forte pedida no brief; erros previsíveis |
| Enums do domínio | **Postgres enums** + espelho em TS | "Tipagem forte" ponta a ponta |
| PWA / Service Worker | **Serwist** (sucessor mantido do next-pwa) | next-pwa está estagnado; Serwist suporta App Router |
| Offline write (logs de série sem rede) | **IndexedDB (Dexie) + fila de sync** | Usuário registra carga na academia com sinal ruim |
| Tipos do banco | `supabase gen types typescript` → `src/types/database.ts` | Fonte única de verdade dos tipos de tabela |
| Estilização | Tailwind + tokens semânticos (CSS vars) | Dark mode e tema premium sem reescrever componentes |
| Componentes base | shadcn/ui (copiados, não dependência) | Controle total do visual premium exigido |

---

## 3. Estrutura de pastas

```
gymguide/
├─ public/
│  ├─ icons/                      # ícones PWA (192, 512, maskable, apple-touch)
│  ├─ splash/                     # splash screens iOS
│  └─ favicon.ico
├─ supabase/
│  ├─ migrations/                 # SQL versionado (0001_initial_schema.sql, ...)
│  ├─ seed.sql                    # goals, categorias, equipamentos, fichas base
│  └─ config.toml
├─ src/
│  ├─ app/                        # ROTEAMENTO (App Router) — só orquestra UI
│  │  ├─ (auth)/
│  │  │  ├─ login/page.tsx
│  │  │  ├─ signup/page.tsx
│  │  │  └─ layout.tsx
│  │  ├─ (onboarding)/
│  │  │  └─ onboarding/page.tsx   # wizard client-side, 6 etapas
│  │  ├─ (app)/                   # shell autenticado (bottom nav)
│  │  │  ├─ dashboard/page.tsx
│  │  │  ├─ workout/
│  │  │  │  ├─ today/page.tsx
│  │  │  │  └─ session/[dayId]/
│  │  │  │     ├─ page.tsx              # lista de exercícios do dia
│  │  │  │     └─ exercise/[exerciseId]/page.tsx   # tela full do exercício
│  │  │  ├─ history/page.tsx
│  │  │  ├─ progress/page.tsx
│  │  │  ├─ profile/page.tsx
│  │  │  └─ layout.tsx
│  │  ├─ admin/
│  │  │  ├─ exercises/…
│  │  │  ├─ templates/…           # fichas + dias + exercícios do dia
│  │  │  ├─ muscle-groups/…
│  │  │  ├─ equipments/…
│  │  │  ├─ media/…
│  │  │  └─ layout.tsx            # guard: role = admin
│  │  ├─ api/
│  │  │  └─ sync/route.ts         # fila offline → servidor
│  │  ├─ manifest.ts              # Web App Manifest (metadata API)
│  │  ├─ layout.tsx               # root: providers, tema, fontes
│  │  └─ globals.css
│  │
│  ├─ core/                       # ⚙️ NÚCLEO — sem Next, React ou Supabase
│  │  ├─ domain/
│  │  │  ├─ entities/             # User, Profile, Exercise, WorkoutTemplate…
│  │  │  ├─ enums/                # Goal, ExperienceLevel, TrainingLocation…
│  │  │  ├─ value-objects/        # RepScheme, RestPeriod…
│  │  │  └─ repositories/         # PORTS (interfaces): IWorkoutTemplateRepo…
│  │  ├─ application/
│  │  │  ├─ use-cases/            # AssignWorkout, CompleteWorkout, RecordMeasurement…
│  │  │  ├─ services/             # PIPELINE de regras (ver §6) + calculadoras
│  │  │  │   ├─ workout/          #   WorkoutSelector · WorkoutValidator · WorkoutGenerator
│  │  │  │   ├─ progression/      #   ProgramProgressionService
│  │  │  │   ├─ gamification/     #   AchievementEvaluator
│  │  │  │   ├─ stats/            #   StatsAggregator · StreakCalculator
│  │  │  │   └─ physical/         #   BmiCalculator · E1rmCalculator
│  │  │  └─ dto/                  # entrada/saída dos use cases
│  │  └─ shared/                  # Result<T,E>, DomainError, Guard
│  │
│  ├─ infrastructure/             # 🔌 ADAPTERS — implementa os ports
│  │  ├─ supabase/
│  │  │  ├─ client.ts             # browser client
│  │  │  ├─ server.ts             # server client (cookies)
│  │  │  ├─ admin.ts              # service-role (só server, nunca no bundle client)
│  │  │  └─ middleware.ts         # refresh de sessão
│  │  ├─ repositories/            # SupabaseWorkoutTemplateRepo implements IWorkoutTemplateRepo
│  │  └─ storage/                 # upload de mídia (Supabase Storage)
│  │
│  ├─ actions/                    # 🎯 Server Actions (finas) por feature
│  │  ├─ auth.actions.ts
│  │  ├─ onboarding.actions.ts
│  │  ├─ workout.actions.ts
│  │  ├─ progress.actions.ts
│  │  └─ admin/*.actions.ts
│  │
│  ├─ components/                 # 🎨 PRESENTATION
│  │  ├─ ui/                      # shadcn primitives (button, dialog, sheet…)
│  │  ├─ onboarding/              # StepSex, StepGoal, StepEquipments, StepLimitations…
│  │  ├─ dashboard/               # StreakRing, TodayCard, StatTile, WeightDeltaCard…
│  │  ├─ workout/                 # ExerciseCard, RestTimer, ExerciseFullView…
│  │  ├─ history/                 # CalendarHeatmap, WeeklyVolumeChart…
│  │  └─ shared/                  # AppShell, BottomNav, EmptyState…
│  │
│  ├─ hooks/                      # useRestTimer, useWorkoutSession, useInstallPrompt
│  ├─ providers/                  # ThemeProvider, SupabaseProvider, QueryProvider
│  ├─ stores/                     # Zustand: workoutSessionStore, timerStore
│  ├─ lib/                        # cn(), constants, zod schemas, formatters
│  └─ types/                      # database.ts (gerado), globals
│
├─ middleware.ts                  # protege (app)/ e /admin, refresh de sessão
├─ next.config.ts                 # Serwist + config PWA
├─ tailwind.config.ts
├─ tsconfig.json                  # paths: @/core, @/infra, @/components…
└─ package.json
```

> **Pastas de feature adicionais (v2)** — `app/(app)/`: `measurements/` (evolução física + fotos), `programs/` (progressão), `achievements/` (gamificação); `app/admin/`: `dashboard/` (analytics), `limitations/`, `equipments/`. `components/`: `progress/`, `gamification/`, `programs/`, `admin/`. `actions/`: `measurement.actions.ts`, `program.actions.ts`, `favorite.actions.ts`, `admin/analytics.actions.ts`.

**Convenção de dependência:** `app/` → `actions/` → `core/application` → `core/domain`. `infrastructure/` também depende de `core/domain` (implementa os ports) e é injetada nas actions. `components/` nunca importa `infrastructure` diretamente.

---

## 4. Design System (premium, minimalista)

O brief pede visual estilo **Apple Fitness / Nike Training Club / Hevy**. Isso se traduz em regras concretas, não em "cards genéricos repetidos":

### Tokens (CSS variables, dark mode nativo)
- **Cor:** base quase-preta (`#0A0A0B`) no dark, off-white (`#FAFAFA`) no light. **Um único accent vibrante** (ex.: `lime/electric` `#D7FF3E` ou `orange` — a definir na FASE 2) usado com parcimônia para CTA e progresso. Cinzas neutros para tudo mais.
- **Tipografia:** display grande (números de treino em `text-6xl`, títulos `text-3xl` tight tracking). Fonte: **Geist** ou **Inter** var. Hierarquia por peso e tamanho, não por cor.
- **Espaço:** muito _whitespace_, `padding` generoso (`p-6`/`p-8`), listas com respiro em vez de grid apertado.
- **Raio & profundidade:** `rounded-2xl`/`rounded-3xl`, sombras sutis, sem bordas duras. "Glass"/blur pontual em headers.
- **Motion (Framer Motion):** transições de página com `layoutId` (imagem do exercício expande para a tela full), `spring` suave, _stagger_ na entrada de listas, contadores animados no dashboard. Duração 200–400ms, `ease-out`.

### Padrões de tela (anti-genérico)
- **Dashboard:** hero do "Treino de hoje" ocupando destaque + anel de streak (estilo Activity Rings) + tiles de estatística minimalistas. Não é um grid de cards iguais.
- **Sessão de treino:** foco total — imagem grande, um exercício por vez, chrome mínimo, cronômetro em _bottom sheet_.
- **Histórico:** heatmap de calendário (estilo GitHub/streak) + gráfico de volume semanal.

Detalhamento de tokens e componentes base entra na **FASE 2**.

---

## 5. Estratégia PWA / Offline (visão)

- **Manifest** via `app/manifest.ts` (name, short_name, icons maskable, `display: standalone`, `theme_color`, `background_color`, `orientation: portrait`).
- **Service Worker** com Serwist: _precache_ do shell; runtime cache **stale-while-revalidate** para catálogo (exercícios, mídia) e **cache-first** para imagens/GIFs baixados.
- **Consulta offline:** ao abrir uma ficha, os dados do template + mídias são persistidos (Cache Storage + IndexedDB) → treino consultável sem rede.
- **Escrita offline:** logs de série (`user_progress`) e conclusão de treino vão para fila no **IndexedDB (Dexie)**; `Background Sync` / `api/sync` reenvia quando volta a conexão. Conclusões são _idempotentes_ (client gera `uuid` da sessão).
- **Instalação:** hook `useInstallPrompt` captura `beforeinstallprompt`; instruções de "Adicionar à Tela de Início" para iOS.

Implementação completa na **FASE 7**.

---

## 6. Serviços de domínio — pipeline de regras (visão)

Toda a personalização é **regra + banco**, orquestrada em serviços puros e testáveis (sem Next/Supabase/IA). Duas cadeias:

### 6.1 Atribuição de ficha (onboarding / troca de perfil)
```
Profile ─▶ WorkoutSelector ─▶ WorkoutValidator ─▶ WorkoutGenerator ─▶ user_workouts (+overrides)
           acha o melhor       valida equip.,      substitui exercícios
           programa/ficha       limitações, nível,  incompatíveis mantendo
                                objetivo, dias       grupo muscular + nível
```
- **WorkoutSelector** — pontua e escolhe o melhor `program`/`workout_template` para o perfil.
- **WorkoutValidator** — dado um template + contexto do usuário (`user_equipments`, `user_limitations`, nível, objetivo, dias), marca cada `workout_exercise` como _ok / equipment / limitation_ e decide se o template é viável.
- **WorkoutGenerator** — para cada exercício inviável, encontra substituto (mesmo grupo muscular, mesmo nível, equipamento compatível, sem contraindicação) e grava `user_workout_overrides`.

### 6.2 Pós-treino (ao concluir uma sessão)
```
CompleteWorkout ─┬─▶ StatsAggregator            → atualiza user_stats (streak, volume, séries…)
                 ├─▶ exercise_progress rollup   → curva de evolução por exercício (e1RM)
                 ├─▶ AchievementEvaluator       → desbloqueia user_achievements (data-driven)
                 └─▶ ProgramProgressionService  → avalia critério da fase → avança user_programs
```

Detalhamento algorítmico (pseudocódigo, scoring, critérios) está em [`03-FLUXOS-E-REGRAS.md`](03-FLUXOS-E-REGRAS.md). Cada serviço recebe repositórios por interface (ports), então roda em teste unitário com _fakes_, sem banco.
