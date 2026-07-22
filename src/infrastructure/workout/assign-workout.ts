import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { mapExperienceToLevel } from "@/core/domain/enums";
import { type Result, ok, err } from "@/core/shared/result";
import { rankCandidates } from "@/core/application/services/workout/workout-selector";
import { validateExercise } from "@/core/application/services/workout/workout-validator";
import { findSubstitute } from "@/core/application/services/workout/workout-generator";
import type {
  ExerciseInfo,
  UserContext,
  WorkoutOverride,
} from "@/core/application/services/workout/types";

type DB = SupabaseClient<Database>;

const MIN_EXERCISES_PER_DAY = 3;
/** Rejeita candidatos que exigiriam adaptar mais que esta fração dos exercícios. */
const MAX_ADAPT_FRACTION = 0.5;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toExerciseInfo(ex: any): ExerciseInfo {
  return {
    id: ex.id,
    slug: ex.slug,
    name: ex.name,
    muscleGroupId: ex.primary_muscle_group_id,
    level: ex.level,
    requiredEquipmentIds: (ex.exercise_equipments ?? [])
      .filter((e: { is_required: boolean }) => e.is_required)
      .map((e: { equipment_id: number }) => e.equipment_id),
    avoidLimitationIds: (ex.exercise_limitations ?? [])
      .filter((l: { restriction: string }) => l.restriction === "avoid")
      .map((l: { limitation_id: number }) => l.limitation_id),
  };
}

/**
 * Avalia um candidato: substitui incompatíveis e decide viabilidade.
 * Retorna os overrides ou `null` se o candidato não for viável.
 */
function evaluateCandidate(
  days: { exercises: { workoutExerciseId: string; exercise: ExerciseInfo }[] }[],
  pool: ExerciseInfo[],
  ctx: UserContext,
): WorkoutOverride[] | null {
  const overrides: WorkoutOverride[] = [];
  let totalExercises = 0;
  let adaptedExercises = 0;

  for (const day of days) {
    const statuses = day.exercises.map((te) => ({
      te,
      status: validateExercise(te.exercise, ctx),
    }));
    totalExercises += statuses.length;
    adaptedExercises += statuses.filter((s) => s.status !== "ok").length;

    const used = new Set(
      statuses.filter((s) => s.status === "ok").map((s) => s.te.exercise.id),
    );
    let remaining = statuses.filter((s) => s.status === "ok").length;

    for (const { te, status } of statuses.filter((s) => s.status !== "ok")) {
      const reason = status as "equipment" | "limitation";
      const sub = findSubstitute(te.exercise, pool, ctx, used);
      if (sub) {
        used.add(sub.id);
        remaining++;
        overrides.push({
          workoutExerciseId: te.workoutExerciseId,
          substituteExerciseId: sub.id,
          reason,
        });
      } else {
        overrides.push({
          workoutExerciseId: te.workoutExerciseId,
          substituteExerciseId: null,
          reason,
        });
      }
    }

    if (remaining < MIN_EXERCISES_PER_DAY) return null; // dia ficou fraco demais
  }

  // ficha exige adaptar demais → não é uma boa opção para este usuário
  if (totalExercises > 0 && adaptedExercises / totalExercises > MAX_ADAPT_FRACTION) {
    return null;
  }

  return overrides;
}

async function loadTemplateDays(supabase: DB, templateId: string) {
  const { data } = await supabase
    .from("workout_days")
    .select(
      "id, day_index, workout_exercises(id, exercises(id, slug, name, primary_muscle_group_id, level, exercise_equipments(equipment_id, is_required), exercise_limitations(limitation_id, restriction)))",
    )
    .eq("template_id", templateId)
    .order("day_index");

  return (data ?? []).map((day) => ({
    exercises: (day.workout_exercises ?? [])
      .filter((we) => we.exercises)
      .map((we) => ({
        workoutExerciseId: we.id,
        exercise: toExerciseInfo(we.exercises),
      })),
  }));
}

/**
 * Atribui (ou reatribui) a ficha do usuário rodando o pipeline
 * Selector → Validator → Generator. Persiste user_workouts + overrides.
 */
export async function assignWorkoutForUser(
  supabase: DB,
  userId: string,
): Promise<Result<{ templateId: string; overrideCount: number }>> {
  // 1) contexto
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "goal_id, experience, available_days, available_time_minutes, training_location",
    )
    .eq("user_id", userId)
    .single();

  if (
    !profile?.goal_id ||
    !profile.experience ||
    !profile.available_days ||
    !profile.available_time_minutes ||
    !profile.training_location
  ) {
    return err("Perfil incompleto para gerar a ficha.");
  }

  const [{ data: eqRows }, { data: limRows }] = await Promise.all([
    supabase.from("user_equipments").select("equipment_id").eq("user_id", userId),
    supabase.from("user_limitations").select("limitation_id").eq("user_id", userId),
  ]);

  const ctx: UserContext = {
    goalId: profile.goal_id,
    level: mapExperienceToLevel(profile.experience),
    days: profile.available_days,
    timeMinutes: profile.available_time_minutes,
    location: profile.training_location,
    equipmentIds: new Set((eqRows ?? []).map((e) => e.equipment_id)),
    limitationIds: new Set((limRows ?? []).map((l) => l.limitation_id)),
  };

  // 2) candidatos (mesmo objetivo) + pool de exercícios
  const [{ data: candRows }, { data: poolRows }] = await Promise.all([
    supabase
      .from("workout_templates")
      .select(
        "id, experience, days_per_week, session_duration_minutes, min_location, priority",
      )
      .eq("goal_id", ctx.goalId)
      .eq("is_active", true),
    supabase
      .from("exercises")
      .select(
        "id, slug, name, primary_muscle_group_id, level, exercise_equipments(equipment_id, is_required), exercise_limitations(limitation_id, restriction)",
      )
      .eq("is_active", true),
  ]);

  const pool = (poolRows ?? []).map(toExerciseInfo);
  const candidates = (candRows ?? []).map((c) => ({
    id: c.id,
    experience: c.experience,
    daysPerWeek: c.days_per_week,
    sessionDuration: c.session_duration_minutes,
    minLocation: c.min_location,
    priority: c.priority,
  }));

  const ranked = rankCandidates(candidates, ctx);
  if (ranked.length === 0) return err("Nenhuma ficha compatível encontrada.");

  // 3) escolhe o melhor candidato viável e gera overrides
  let chosenId: string | null = null;
  let overrides: WorkoutOverride[] = [];
  for (const { template } of ranked) {
    const days = await loadTemplateDays(supabase, template.id);
    const result = evaluateCandidate(days, pool, ctx);
    if (result !== null) {
      chosenId = template.id;
      overrides = result;
      break;
    }
  }
  if (!chosenId) return err("Nenhuma ficha viável para o seu perfil.");

  // 4) persiste (1 ficha ativa por usuário)
  await supabase
    .from("user_workouts")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("is_active", true);

  const { data: uw, error: uwError } = await supabase
    .from("user_workouts")
    .insert({
      user_id: userId,
      template_id: chosenId,
      source: "algorithm",
      is_active: true,
    })
    .select("id")
    .single();
  if (uwError || !uw) return err("Falha ao salvar a ficha.");

  if (overrides.length > 0) {
    await supabase.from("user_workout_overrides").insert(
      overrides.map((o) => ({
        user_workout_id: uw.id,
        workout_exercise_id: o.workoutExerciseId,
        substitute_exercise_id: o.substituteExerciseId,
        reason: o.reason,
      })),
    );
  }

  return ok({ templateId: chosenId, overrideCount: overrides.length });
}
