"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import {
  type UnlockedAchievement,
  finalizeWorkout,
} from "@/infrastructure/workout/finalize-workout";
import { type Result, ok, err } from "@/core/shared/result";
import {
  type CompleteWorkoutInput,
  completeWorkoutSchema,
} from "@/lib/validations/session";

/**
 * Conclui uma sessão: grava completed_workouts + user_progress (dados brutos).
 * As agregações derivadas (user_stats, streak, conquistas, progressão) entram na 5c.
 */
export async function completeWorkoutAction(
  input: CompleteWorkoutInput,
): Promise<
  Result<{
    totalVolume: number;
    totalSets: number;
    unlocked: UnlockedAchievement[];
    programAdvanced: boolean;
  }>
> {
  const parsed = completeWorkoutSchema.safeParse(input);
  if (!parsed.success) return err("Dados da sessão inválidos.");
  const d = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("Sessão expirada.");

  // volume total e séries efetivamente registradas
  let totalVolume = 0;
  let totalSets = 0;
  for (const entry of d.entries) {
    for (const set of entry.sets) {
      if (set.reps != null || set.weight != null) totalSets++;
      if (set.weight != null && set.reps != null) totalVolume += set.weight * set.reps;
    }
  }

  const { data: completed, error: cwError } = await supabase
    .from("completed_workouts")
    .insert({
      user_id: user.id,
      user_workout_id: d.userWorkoutId,
      workout_day_id: d.workoutDayId,
      started_at: new Date(Date.now() - d.durationSeconds * 1000).toISOString(),
      duration_seconds: d.durationSeconds,
      total_volume: Math.round(totalVolume * 100) / 100,
    })
    .select("id, completed_at")
    .single();
  if (cwError || !completed) return err("Falha ao salvar o treino.");

  const progressRows = d.entries.flatMap((entry) =>
    entry.sets
      .map((set, i) => ({ set, i }))
      .filter(({ set }) => set.reps != null || set.weight != null)
      .map(({ set, i }) => ({
        user_id: user.id,
        completed_workout_id: completed.id,
        workout_exercise_id: entry.workoutExerciseId,
        exercise_id: entry.exerciseId,
        set_number: i + 1,
        reps_done: set.reps,
        weight_kg: set.weight,
      })),
  );

  if (progressRows.length > 0) {
    await supabase.from("user_progress").insert(progressRows);
  }

  // pós-treino: estatísticas, evolução por exercício, conquistas e progressão de programa
  const { unlocked, programAdvanced } = await finalizeWorkout(supabase, {
    userId: user.id,
    completedWorkoutId: completed.id,
    completedAt: completed.completed_at,
    durationSeconds: d.durationSeconds,
    totalVolume,
    entries: d.entries.map((e) => ({ exerciseId: e.exerciseId, sets: e.sets })),
  });

  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/workout");
  revalidatePath("/achievements");

  return ok({ totalVolume: Math.round(totalVolume), totalSets, unlocked, programAdvanced });
}
