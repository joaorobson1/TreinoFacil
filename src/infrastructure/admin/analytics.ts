import { createAdminClient } from "@/infrastructure/supabase/admin";

export type AdminAnalytics = {
  totalUsers: number;
  active7d: number;
  active30d: number;
  totalCompleted: number;
  avgFrequency: number;
  newUsers: { label: string; count: number }[];
  topExercises: { name: string; count: number }[];
  topTemplates: { name: string; count: number }[];
};

const DAY = 86_400_000;
const weekStart = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x.getTime();
};

/**
 * Métricas do painel admin — agregadas entre TODOS os usuários via service role
 * (ignora RLS). Agregação em JS por ora; em escala, migrar para RPC/materialized views.
 */
export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const db = createAdminClient();
  const now = Date.now();
  const d7 = new Date(now - 7 * DAY).toISOString();
  const d30 = new Date(now - 30 * DAY).toISOString();

  const [usersRes, completedRes, epRes, uwRes] = await Promise.all([
    db.from("users").select("created_at"),
    db.from("completed_workouts").select("user_id, completed_at"),
    db.from("exercise_progress").select("exercises(name)"),
    db.from("user_workouts").select("workout_templates(name)"),
  ]);

  const users = usersRes.data ?? [];
  const completed = completedRes.data ?? [];

  const active7d = new Set(
    completed.filter((c) => c.completed_at >= d7).map((c) => c.user_id),
  ).size;
  const completed30 = completed.filter((c) => c.completed_at >= d30);
  const active30d = new Set(completed30.map((c) => c.user_id)).size;
  const avgFrequency =
    active30d > 0 ? Math.round((completed30.length / active30d) * 10) / 10 : 0;

  // novos usuários por semana (últimas 8)
  const byWeek = new Map<number, number>();
  for (const u of users) {
    const w = weekStart(new Date(u.created_at));
    byWeek.set(w, (byWeek.get(w) ?? 0) + 1);
  }
  const thisWeek = weekStart(new Date());
  const newUsers = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(thisWeek - (7 - i) * 7 * DAY);
    return { label: `${d.getDate()}/${d.getMonth() + 1}`, count: byWeek.get(d.getTime()) ?? 0 };
  });

  const rank = (rows: { name: string }[]) => {
    const m = new Map<string, number>();
    for (const r of rows) m.set(r.name, (m.get(r.name) ?? 0) + 1);
    return [...m.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  return {
    totalUsers: users.length,
    active7d,
    active30d,
    totalCompleted: completed.length,
    avgFrequency,
    newUsers,
    topExercises: rank(
      (epRes.data ?? []).map((r) => ({ name: r.exercises?.name ?? "—" })),
    ),
    topTemplates: rank(
      (uwRes.data ?? []).map((r) => ({ name: r.workout_templates?.name ?? "—" })),
    ),
  };
}

export type ContentHealth = {
  exercises: number;
  templates: number;
  programs: number;
  achievements: number;
  /** problemas acionáveis, cada um com link para a área de correção */
  issues: { label: string; count: number; href: string }[];
};

/**
 * Saúde do CONTEÚDO gerenciado pelo admin (não usuários): contagens e
 * problemas acionáveis — exercícios sem mídia/órfãos, fichas sem dias, etc.
 * Lê o catálogo (tabelas pequenas) e agrega em JS.
 */
export async function getContentHealth(): Promise<ContentHealth> {
  const db = createAdminClient();
  const [exRes, mediaRes, usedRes, tplRes, progRes, achRes] = await Promise.all([
    db.from("exercises").select("id, is_active"),
    db.from("exercise_media").select("exercise_id"),
    db.from("workout_exercises").select("exercise_id"),
    db.from("workout_templates").select("id, is_active, workout_days(id)"),
    db.from("programs").select("id, is_active, program_phases(id)"),
    db.from("achievements").select("id, is_active"),
  ]);

  const exercises = exRes.data ?? [];
  const mediaSet = new Set((mediaRes.data ?? []).map((m) => m.exercise_id));
  const usedSet = new Set((usedRes.data ?? []).map((u) => u.exercise_id));
  const templates = tplRes.data ?? [];
  const programs = progRes.data ?? [];
  const achievements = achRes.data ?? [];

  const exInactive = exercises.filter((e) => !e.is_active).length;
  const exNoMedia = exercises.filter((e) => e.is_active && !mediaSet.has(e.id)).length;
  const exOrphan = exercises.filter((e) => e.is_active && !usedSet.has(e.id)).length;
  const tplNoDays = templates.filter((t) => (t.workout_days ?? []).length === 0).length;
  const progNoPhases = programs.filter((p) => (p.program_phases ?? []).length === 0).length;
  const achInactive = achievements.filter((a) => !a.is_active).length;

  const issues = [
    { label: "exercícios sem mídia", count: exNoMedia, href: "/admin/exercises" },
    { label: "exercícios fora de qualquer ficha", count: exOrphan, href: "/admin/exercises" },
    { label: "exercícios inativos", count: exInactive, href: "/admin/exercises" },
    { label: "fichas sem dias", count: tplNoDays, href: "/admin/templates" },
    { label: "programas sem fases", count: progNoPhases, href: "/admin/programs" },
    { label: "conquistas inativas", count: achInactive, href: "/admin/achievements" },
  ].filter((i) => i.count > 0);

  return {
    exercises: exercises.length,
    templates: templates.length,
    programs: programs.length,
    achievements: achievements.length,
    issues,
  };
}
