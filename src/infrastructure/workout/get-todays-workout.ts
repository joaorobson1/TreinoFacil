import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { TodayWorkout } from "@/components/dashboard/today-workout-card";

type DB = SupabaseClient<Database>;

/**
 * Treino de hoje por ROTAÇÃO: próximo dia = (último day_index mod N) + 1.
 * Não é preso a dia da semana — avança conforme o usuário treina.
 * Ver docs/03-FLUXOS-E-REGRAS.md §6.2.
 */
export async function getTodaysWorkout(supabase: DB, userId: string): Promise<TodayWorkout> {
  const { data: uw } = await supabase
    .from("user_workouts")
    .select(
      "id, workout_templates(session_duration_minutes, workout_days(id, day_index, name, focus, workout_exercises(id)))",
    )
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  const template = uw?.workout_templates;
  if (!template) return null;

  const days = [...template.workout_days].sort((a, b) => a.day_index - b.day_index);
  if (days.length === 0) return null;

  const { data: last } = await supabase
    .from("completed_workouts")
    .select("workout_day_id")
    .eq("user_workout_id", uw.id)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextIndex = 1;
  if (last) {
    const lastDay = days.find((d) => d.id === last.workout_day_id);
    if (lastDay) nextIndex = (lastDay.day_index % days.length) + 1;
  }
  const day = days.find((d) => d.day_index === nextIndex) ?? days[0];

  const { data: overrides } = await supabase
    .from("user_workout_overrides")
    .select("workout_exercise_id, substitute_exercise_id")
    .eq("user_workout_id", uw.id);
  const removed = new Set(
    (overrides ?? [])
      .filter((o) => !o.substitute_exercise_id)
      .map((o) => o.workout_exercise_id),
  );

  const { count: additions } = await supabase
    .from("user_workout_additions")
    .select("*", { count: "exact", head: true })
    .eq("user_workout_id", uw.id)
    .eq("workout_day_id", day.id);

  const templateCount = day.workout_exercises.filter((we) => !removed.has(we.id)).length;

  return {
    dayId: day.id,
    dayName: day.name,
    focus: day.focus,
    exerciseCount: templateCount + (additions ?? 0),
    durationMin: template.session_duration_minutes,
  };
}
