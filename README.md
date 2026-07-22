# TreinoFácil

App **PWA** que entrega fichas de treino **personalizadas** para iniciantes na academia — montadas por **regras e banco de dados**, sem nenhuma IA. O usuário responde um onboarding (objetivo, experiência, dias, tempo, equipamentos, limitações) e o sistema seleciona e adapta automaticamente a ficha ideal.

> Status: em desenvolvimento, construído por fases. Concluídas as FASES 1–6b (arquitetura, banco, auth, onboarding, dashboard, sistema de treinos e boa parte do painel admin).

---

## Como funciona (o diferencial)

Toda a personalização é **determinística**, sem IA, através de um pipeline de 3 serviços puros:

1. **WorkoutSelector** — pontua e escolhe a melhor ficha para o perfil (objetivo, nível, dias, tempo, ambiente).
2. **WorkoutValidator** — valida cada exercício contra os **equipamentos** disponíveis e as **limitações físicas** do usuário.
3. **WorkoutGenerator** — substitui exercícios incompatíveis por equivalentes (mesmo grupo muscular e dificuldade) ou os remove, respeitando um teto de adaptação.

Um exercício contraindicado (ex.: agachamento para quem tem dor no joelho) **nunca** é atribuído.

---

## Funcionalidades

- **Onboarding** em etapas com preset de equipamentos por ambiente
- **Atribuição automática** da ficha ao concluir o onboarding (ou botão "Gerar meu treino")
- **Execução do treino**: um exercício por vez, registro de séries (carga/reps), **cronômetro de descanso** e **vídeos** de demonstração (YouTube)
- **Dashboard**: treino de hoje (rotação), anel de sequência (streak) e estatísticas
- **Histórico**: calendário de frequência, volume semanal e treinos recentes
- **Conquistas** (gamificação) desbloqueadas por regra
- **Progresso por exercício** (melhor carga e 1RM estimado)
- **Painel administrativo**: dashboard analítico + CRUD de exercícios, fichas (com dias/exercícios) e catálogo (objetivos, grupos musculares, equipamentos, limitações, categorias)
- **Dark mode**, mobile-first

---

## Stack

- [Next.js 15](https://nextjs.org) (App Router, Server Actions) + React 19 + TypeScript
- [Supabase](https://supabase.com) — Auth + PostgreSQL + Row Level Security
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://www.framer.com/motion/) · [Zod](https://zod.dev) · [next-themes](https://github.com/pacocoursey/next-themes)
- Arquitetura **Clean Architecture** (domínio/aplicação sem dependência de framework)

---

## Rodando localmente

### Pré-requisitos
- Node.js 20+
- Uma conta no [Supabase](https://supabase.com)

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar o Supabase
Crie um projeto no Supabase, copie o arquivo de exemplo e preencha com as chaves do seu projeto (Dashboard → Project Settings → API):
```bash
cp .env.example .env.local
```
```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key   # secreta, só servidor
```

### 3. Aplicar o schema e os dados
No **SQL Editor** do Supabase (ou via CLI), rode em ordem:
1. `supabase/migrations/0001_initial_schema.sql` — tabelas, enums, RLS, triggers
2. `supabase/seed.sql` — dados de referência (objetivos, grupos, equipamentos, limitações, conquistas)

Depois, popule o catálogo de exercícios, fichas e vídeos (usam a service role do `.env.local`):
```bash
npm run db:seed:workouts   # 37 exercícios + 24 fichas
npm run db:seed:videos     # vídeos de demonstração (YouTube)
```

### 4. Rodar
```bash
npm run dev
```
Acesse http://localhost:3000.

### 5. Tornar-se admin
Para acessar o painel em `/admin`:
```bash
node scripts/make-admin.mjs seu@email.com
```

> Opcional — gerar os tipos do banco (`src/types/database.ts`): defina `SUPABASE_ACCESS_TOKEN` no `.env.local` e rode `npm run db:types`.

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run typecheck` | Checagem de tipos (tsc) |
| `npm run lint` | ESLint |
| `npm run db:seed` | Seed dos dados de referência |
| `npm run db:seed:workouts` | Seed de exercícios e fichas |
| `npm run db:seed:videos` | Seed dos vídeos dos exercícios |
| `npm run db:types` | Gera os tipos TypeScript do banco |

---

## Estrutura

```
src/
├─ app/            # rotas (App Router): (auth) (app) (session) admin ...
├─ core/           # domínio + aplicação (sem framework) — regras e pipeline
├─ infrastructure/ # Supabase clients, orquestradores, analytics
├─ actions/        # Server Actions (finas)
├─ components/     # UI (shadcn, workout, dashboard, admin, ...)
└─ lib/            # utils, validações (Zod), constantes
supabase/          # migration + seed SQL
scripts/           # seeds e verificações (node/tsx)
docs/              # arquitetura, banco de dados e fluxos
```

---

## Documentação

Detalhes de arquitetura, modelagem e regras estão em [`docs/`](docs/):
- [`01-ARQUITETURA.md`](docs/01-ARQUITETURA.md)
- [`02-BANCO-DE-DADOS.md`](docs/02-BANCO-DE-DADOS.md)
- [`03-FLUXOS-E-REGRAS.md`](docs/03-FLUXOS-E-REGRAS.md)

---

## Roadmap

- [x] FASE 1–2 — Arquitetura, banco, configuração e base
- [x] FASE 3 — Autenticação e onboarding
- [x] FASE 4 — Dashboard
- [x] FASE 5 — Sistema de treinos (pipeline, execução, estatísticas, conquistas)
- [x] FASE 6a/6b — Painel admin (analytics, exercícios, fichas, catálogo)
- [ ] FASE 6c — Programas (progressão), CRUD de conquistas, upload de mídia
- [ ] FASE 7 — PWA instalável, offline, testes e deploy
