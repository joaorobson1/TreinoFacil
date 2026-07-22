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
