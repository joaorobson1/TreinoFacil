import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { SessionRunner } from "@/components/workout/session-runner";
import type { SessionExercise } from "@/components/workout/types";
import type { Media } from "@/components/workout/exercise-media";
import { ROUTES } from "@/lib/routes";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ dayId: string }>;
}) {
  const { dayId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  // ficha ativa
  const { data: uw } = await supabase
    .from("user_workouts")
    .select("id, template_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();
  if (!uw) redirect(ROUTES.workout);

  // o dia precisa pertencer ao template da ficha ativa
  const { data: day } = await supabase
    .from("workout_days")
    .select("id, name, template_id, workout_exercises(id, position, sets, reps, rest_seconds, exercise_id)")
    .eq("id", dayId)
    .eq("template_id", uw.template_id)
    .maybeSingle();
  if (!day) redirect(ROUTES.workout);

  // overrides (substituições / remoções) da ficha ativa
  const { data: overrides } = await supabase
    .from("user_workout_overrides")
    .select("workout_exercise_id, substitute_exercise_id")
    .eq("user_workout_id", uw.id);
  const overrideMap = new Map(
    (overrides ?? []).map((o) => [o.workout_exercise_id, o.substitute_exercise_id]),
  );

  // exercícios extras adicionados pelo usuário a este dia
  const { data: additions } = await supabase
    .from("user_workout_additions")
    .select("id, exercise_id, sets, reps, rest_seconds")
    .eq("user_workout_id", uw.id)
    .eq("workout_day_id", dayId)
    .order("created_at");

  // lista efetiva: template (com overrides) + adicionados
  const effective: {
    key: string;
    workoutExerciseId: string | null;
    exerciseId: string;
    targetSets: number;
    targetReps: string;
    restSeconds: number;
  }[] = [...day.workout_exercises]
    .sort((a, b) => a.position - b.position)
    .flatMap((we) => {
      const hasOverride = overrideMap.has(we.id);
      const substitute = overrideMap.get(we.id);
      if (hasOverride && substitute == null) return []; // removido
      return [
        {
          key: `we-${we.id}`,
          workoutExerciseId: we.id,
          exerciseId: substitute ?? we.exercise_id,
          targetSets: we.sets,
          targetReps: we.reps,
          restSeconds: we.rest_seconds,
        },
      ];
    });

  for (const a of additions ?? []) {
    effective.push({
      key: `add-${a.id}`,
      workoutExerciseId: null,
      exerciseId: a.exercise_id,
      targetSets: a.sets,
      targetReps: a.reps,
      restSeconds: a.rest_seconds,
    });
  }

  if (effective.length === 0) redirect(ROUTES.workout);

  // detalhes dos exercícios efetivos
  const { data: details } = await supabase
    .from("exercises")
    .select(
      "id, name, description, execution, breathing, common_mistakes, tips, exercise_muscle_groups(role, muscle_groups(name)), exercise_media(type, url, is_primary, position)",
    )
    .in("id", effective.map((e) => e.exerciseId));

  const detailMap = new Map((details ?? []).map((d) => [d.id, d]));

  const exercises: SessionExercise[] = effective.flatMap((e) => {
    const d = detailMap.get(e.exerciseId);
    if (!d) return [];
    const muscles = (d.exercise_muscle_groups ?? [])
      .map((m) => ({ name: m.muscle_groups?.name ?? "", role: m.role }))
      .filter((m) => m.name)
      .sort((a) => (a.role === "primary" ? -1 : 1));
    const media: Media[] = (d.exercise_media ?? [])
      .slice()
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position)
      .map((m) => ({ type: m.type, url: m.url }));

    return [
      {
        id: e.key,
        workoutExerciseId: e.workoutExerciseId,
        exerciseId: e.exerciseId,
        name: d.name,
        description: d.description,
        execution: d.execution,
        breathing: d.breathing,
        commonMistakes: d.common_mistakes,
        tips: d.tips,
        muscles,
        media,
        targetSets: e.targetSets,
        targetReps: e.targetReps,
        restSeconds: e.restSeconds,
      },
    ];
  });

  return (
    <SessionRunner
      dayName={day.name}
      dayId={day.id}
      userWorkoutId={uw.id}
      exercises={exercises}
    />
  );
}
