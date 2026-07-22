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

/** Substitui incompatíveis; retorna os overrides e se a ficha é viável para o usuário. */
function evaluateCandidate(
  days: { exercises: { workoutExerciseId: string; exercise: ExerciseInfo }[] }[],
  pool: ExerciseInfo[],
  ctx: UserContext,
): { overrides: WorkoutOverride[]; viable: boolean } {
  const overrides: WorkoutOverride[] = [];
  let totalExercises = 0;
  let adaptedExercises = 0;
  let viable = true;

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
        overrides.push({ workoutExerciseId: te.workoutExerciseId, substituteExerciseId: sub.id, reason });
      } else {
        overrides.push({ workoutExerciseId: te.workoutExerciseId, substituteExerciseId: null, reason });
      }
    }

    if (remaining < MIN_EXERCISES_PER_DAY) viable = false;
  }

  if (totalExercises > 0 && adaptedExercises / totalExercises > MAX_ADAPT_FRACTION) {
    viable = false;
  }
  return { overrides, viable };
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
      .map((we) => ({ workoutExerciseId: we.id, exercise: toExerciseInfo(we.exercises) })),
  }));
}

// ---------------------------------------------------------------------------
// Helpers reutilizáveis (também usados pela progressão de programas)
// ---------------------------------------------------------------------------
export async function loadUserContext(supabase: DB, userId: string): Promise<UserContext | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("goal_id, experience, available_days, available_time_minutes, training_location")
    .eq("user_id", userId)
    .single();

  if (
    !profile?.goal_id ||
    !profile.experience ||
    !profile.available_days ||
    !profile.available_time_minutes ||
    !profile.training_location
  ) {
    return null;
  }

  const [{ data: eqRows }, { data: limRows }] = await Promise.all([
    supabase.from("user_equipments").select("equipment_id").eq("user_id", userId),
    supabase.from("user_limitations").select("limitation_id").eq("user_id", userId),
  ]);

  return {
    goalId: profile.goal_id,
    level: mapExperienceToLevel(profile.experience),
    days: profile.available_days,
    timeMinutes: profile.available_time_minutes,
    location: profile.training_location,
    equipmentIds: new Set((eqRows ?? []).map((e) => e.equipment_id)),
    limitationIds: new Set((limRows ?? []).map((l) => l.limitation_id)),
  };
}

export async function loadExercisePool(supabase: DB): Promise<ExerciseInfo[]> {
  const { data } = await supabase
    .from("exercises")
    .select(
      "id, slug, name, primary_muscle_group_id, level, exercise_equipments(equipment_id, is_required), exercise_limitations(limitation_id, restriction)",
    )
    .eq("is_active", true);
  return (data ?? []).map(toExerciseInfo);
}

export async function evaluateTemplate(
  supabase: DB,
  templateId: string,
  pool: ExerciseInfo[],
  ctx: UserContext,
) {
  const days = await loadTemplateDays(supabase, templateId);
  return evaluateCandidate(days, pool, ctx);
}

/** Persiste a ficha ativa do usuário (1 por vez) + overrides. */
export async function persistAssignment(
  supabase: DB,
  userId: string,
  templateId: string,
  overrides: WorkoutOverride[],
  opts: { source: "algorithm" | "manual" | "admin"; programId?: string | null; phaseId?: string | null },
): Promise<Result<{ templateId: string; overrideCount: number }>> {
  await supabase
    .from("user_workouts")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("is_active", true);

  const { data: uw, error } = await supabase
    .from("user_workouts")
    .insert({
      user_id: userId,
      template_id: templateId,
      source: opts.source,
      is_active: true,
      user_program_id: opts.programId ?? null,
      program_phase_id: opts.phaseId ?? null,
    })
    .select("id")
    .single();
  if (error || !uw) return err("Falha ao salvar a ficha.");

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
  return ok({ templateId, overrideCount: overrides.length });
}

/** Tenta enrolar o usuário num programa compatível (objetivo + nível). */
async function tryEnrollProgram(
  supabase: DB,
  userId: string,
  ctx: UserContext,
  pool: ExerciseInfo[],
): Promise<Result<{ templateId: string; overrideCount: number }> | null> {
  const { data: programs } = await supabase
    .from("programs")
    .select("id, experience, program_phases(id, phase_index, template_id)")
    .eq("goal_id", ctx.goalId)
    .eq("is_active", true);

  const program = (programs ?? []).find(
    (p) => p.experience === ctx.level && (p.program_phases ?? []).length > 0,
  );
  if (!program) return null;

  const phase1 = [...program.program_phases].sort((a, b) => a.phase_index - b.phase_index)[0];
  const { overrides, viable } = await evaluateTemplate(supabase, phase1.template_id, pool, ctx);
  if (!viable) return null; // programa não encaixa nos equipamentos → cai no avulso

  const { data: up } = await supabase
    .from("user_programs")
    .insert({
      user_id: userId,
      program_id: program.id,
      current_phase_id: phase1.id,
      status: "active",
      is_active: true,
    })
    .select("id")
    .single();

  return persistAssignment(supabase, userId, phase1.template_id, overrides, {
    source: "algorithm",
    programId: up?.id ?? null,
    phaseId: phase1.id,
  });
}

/**
 * Atribui (ou reatribui) a ficha do usuário. Prioriza PROGRAMA compatível
 * (evolução automática); cai para ficha avulsa via Selector → Validator → Generator.
 */
export async function assignWorkoutForUser(
  supabase: DB,
  userId: string,
): Promise<Result<{ templateId: string; overrideCount: number }>> {
  const ctx = await loadUserContext(supabase, userId);
  if (!ctx) return err("Perfil incompleto para gerar a ficha.");

  const pool = await loadExercisePool(supabase);

  // reatribuir zera o programa anterior
  await supabase
    .from("user_programs")
    .update({ is_active: false, status: "paused" })
    .eq("user_id", userId)
    .eq("is_active", true);

  // 1) programa compatível?
  const enrolled = await tryEnrollProgram(supabase, userId, ctx, pool);
  if (enrolled) return enrolled;

  // 2) ficha avulsa
  const { data: candRows } = await supabase
    .from("workout_templates")
    .select("id, experience, days_per_week, session_duration_minutes, min_location, priority")
    .eq("goal_id", ctx.goalId)
    .eq("is_active", true);

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

  for (const { template } of ranked) {
    const { overrides, viable } = await evaluateTemplate(supabase, template.id, pool, ctx);
    if (viable) {
      return persistAssignment(supabase, userId, template.id, overrides, { source: "algorithm" });
    }
  }
  return err("Nenhuma ficha viável para o seu perfil.");
}
