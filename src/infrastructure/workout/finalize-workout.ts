import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { epley1RM } from "@/core/application/services/physical/e1rm";
import {
  type AchievementContext,
  isAchievementUnlocked,
} from "@/core/application/services/gamification/achievement-evaluator";

type DB = SupabaseClient<Database>;

export type UnlockedAchievement = {
  slug: string;
  name: string;
  icon: string | null;
  description: string | null;
};

type FinalizeInput = {
  userId: string;
  completedWorkoutId: string;
  completedAt: string;
  durationSeconds: number;
  totalVolume: number;
  entries: {
    exerciseId: string;
    sets: { weight: number | null; reps: number | null }[];
  }[];
};

const dayKey = (iso: string) => iso.slice(0, 10);
const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86_400_000);

/**
 * Executa o pós-treino: agrega user_stats, grava exercise_progress e avalia
 * conquistas. Retorna as conquistas recém-desbloqueadas para exibir ao usuário.
 * Ver docs/01-ARQUITETURA.md §6.2.
 */
export async function finalizeWorkout(
  supabase: DB,
  input: FinalizeInput,
): Promise<{ unlocked: UnlockedAchievement[] }> {
  const { userId, completedWorkoutId, completedAt, durationSeconds, totalVolume } = input;

  // séries/reps efetivamente registradas
  let sessionSets = 0;
  let sessionReps = 0;
  for (const e of input.entries) {
    for (const s of e.sets) {
      if (s.reps != null || s.weight != null) sessionSets++;
      if (s.reps != null) sessionReps += s.reps;
    }
  }

  // ---------- user_stats (incremental) ----------
  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  const today = dayKey(completedAt);
  const lastKey = stats?.last_workout_at ? dayKey(stats.last_workout_at) : null;
  let currentStreak: number;
  if (!lastKey) currentStreak = 1;
  else if (lastKey === today) currentStreak = Math.max(1, stats?.current_streak ?? 1);
  else currentStreak = daysBetween(today, lastKey) === 1 ? (stats?.current_streak ?? 0) + 1 : 1;

  const totalWorkouts = (stats?.total_workouts ?? 0) + 1;
  const totalSets = (stats?.total_sets ?? 0) + sessionSets;
  const totalReps = (stats?.total_reps ?? 0) + sessionReps;
  const totalVolumeKg = Number(stats?.total_volume_kg ?? 0) + totalVolume;
  const longestStreak = Math.max(stats?.longest_streak ?? 0, currentStreak);

  await supabase
    .from("user_stats")
    .update({
      total_workouts: totalWorkouts,
      total_sets: totalSets,
      total_reps: totalReps,
      total_volume_kg: totalVolumeKg,
      total_duration_seconds: (stats?.total_duration_seconds ?? 0) + durationSeconds,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      first_workout_at: stats?.first_workout_at ?? completedAt,
      last_workout_at: completedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  // ---------- exercise_progress + detecção de evolução de carga ----------
  const exerciseIds = input.entries.map((e) => e.exerciseId);
  const { data: prev } = await supabase
    .from("exercise_progress")
    .select("exercise_id, top_weight_kg")
    .eq("user_id", userId)
    .in("exercise_id", exerciseIds);
  const prevMax = new Map<string, number>();
  const prevExists = new Set<string>();
  for (const r of prev ?? []) {
    prevExists.add(r.exercise_id);
    if (r.top_weight_kg != null)
      prevMax.set(r.exercise_id, Math.max(prevMax.get(r.exercise_id) ?? 0, r.top_weight_kg));
  }

  let hadLoadProgress = false;
  const progressRows = input.entries
    .map((e) => {
      const weights = e.sets.map((s) => s.weight ?? 0);
      const topWeight = Math.max(0, ...weights);
      const setsCount = e.sets.filter((s) => s.reps != null || s.weight != null).length;
      const reps = e.sets.reduce((a, s) => a + (s.reps ?? 0), 0);
      const volume = e.sets.reduce((a, s) => a + (s.weight ?? 0) * (s.reps ?? 0), 0);
      const e1rm = Math.max(0, ...e.sets.map((s) => epley1RM(s.weight ?? 0, s.reps ?? 0)));
      if (prevExists.has(e.exerciseId) && topWeight > (prevMax.get(e.exerciseId) ?? 0)) {
        hadLoadProgress = true;
      }
      return { e, topWeight, setsCount, reps, volume, e1rm };
    })
    .filter((r) => r.setsCount > 0)
    .map((r) => ({
      user_id: userId,
      exercise_id: r.e.exerciseId,
      completed_workout_id: completedWorkoutId,
      performed_on: today,
      top_weight_kg: r.topWeight || null,
      total_sets: r.setsCount,
      total_reps: r.reps,
      total_volume: r.volume,
      best_e1rm: r.e1rm || null,
    }));

  if (progressRows.length > 0) {
    await supabase.from("exercise_progress").insert(progressRows);
  }

  // ---------- conquistas ----------
  const [{ data: achievements }, { data: owned }] = await Promise.all([
    supabase.from("achievements").select("id, slug, name, icon, description, criteria, threshold").eq("is_active", true),
    supabase.from("user_achievements").select("achievement_id").eq("user_id", userId),
  ]);
  const ownedIds = new Set((owned ?? []).map((o) => o.achievement_id));

  const ctx: AchievementContext = {
    totalWorkouts,
    currentStreak,
    totalVolumeKg,
    totalSets,
    hadLoadProgress,
    perfectMonth: false, // avaliação mensal completa fica para uma etapa futura
    bodyWeightChange: 0,
  };

  const unlocked: UnlockedAchievement[] = [];
  const toInsert: { user_id: string; achievement_id: number }[] = [];
  for (const a of achievements ?? []) {
    if (ownedIds.has(a.id)) continue;
    if (isAchievementUnlocked(a.criteria, Number(a.threshold), ctx)) {
      toInsert.push({ user_id: userId, achievement_id: a.id });
      unlocked.push({ slug: a.slug, name: a.name, icon: a.icon, description: a.description });
    }
  }
  if (toInsert.length > 0) {
    await supabase.from("user_achievements").insert(toInsert);
  }

  return { unlocked };
}
