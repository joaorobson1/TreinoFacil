import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Clock, Dumbbell, Sparkles } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import { GenerateWorkoutButton } from "@/components/workout/generate-workout-button";
import {
  type EditorDay,
  FichaEditor,
} from "@/components/workout/ficha-editor";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Treino" };

export default async function WorkoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  const { data: uw } = await supabase
    .from("user_workouts")
    .select(
      "id, workout_templates(name, days_per_week, session_duration_minutes, workout_days(id, day_index, name, focus, workout_exercises(id, position, sets, reps, exercise_id, exercises(name))))",
    )
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  // ---------- Sem ficha: estado vazio + botão ----------
  if (!uw?.workout_templates) {
    return (
      <div className="mx-auto flex min-h-[70dvh] w-full max-w-md flex-col px-6 pt-8">
        <h1 className="mb-2 text-2xl font-bold tracking-tight">Treino</h1>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <div className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-2xl">
            <Dumbbell className="size-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold">Você ainda não tem uma ficha</h2>
            <p className="text-muted-foreground max-w-xs text-sm text-pretty">
              Vamos montar seu treino a partir do seu objetivo, nível, tempo e
              equipamentos — na hora, por regras.
            </p>
          </div>
          <GenerateWorkoutButton className="mt-2 w-full" />
        </div>
      </div>
    );
  }

  const template = uw.workout_templates;

  const [{ data: overrides }, { data: additions }, { data: catalog }] =
    await Promise.all([
      supabase
        .from("user_workout_overrides")
        .select("workout_exercise_id, substitute_exercise_id")
        .eq("user_workout_id", uw.id),
      supabase
        .from("user_workout_additions")
        .select("id, workout_day_id, exercise_id, sets, reps, exercises(name)")
        .eq("user_workout_id", uw.id)
        .order("created_at"),
      supabase
        .from("exercises")
        .select("id, name, muscle_groups(name)")
        .eq("is_active", true)
        .order("name"),
    ]);

  const overrideMap = new Map(
    (overrides ?? []).map((o) => [o.workout_exercise_id, o.substitute_exercise_id]),
  );
  const catalogMap = new Map((catalog ?? []).map((c) => [c.id, c.name]));
  const pickerCatalog = (catalog ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    muscle: c.muscle_groups?.name ?? "Outros",
  }));
  const personalized = (overrides ?? []).length > 0 || (additions ?? []).length > 0;

  const additionsByDay = new Map<string, typeof additions>();
  for (const a of additions ?? []) {
    additionsByDay.set(a.workout_day_id, [...(additionsByDay.get(a.workout_day_id) ?? []), a]);
  }

  const days: EditorDay[] = [...template.workout_days]
    .sort((a, b) => a.day_index - b.day_index)
    .map((day) => {
      const templateExercises = [...day.workout_exercises]
        .sort((a, b) => a.position - b.position)
        .flatMap((we) => {
          const hasOverride = overrideMap.has(we.id);
          const substitute = overrideMap.get(we.id);
          if (hasOverride && substitute == null) return [];
          const name = substitute
            ? (catalogMap.get(substitute) ?? "—")
            : (we.exercises?.name ?? "—");
          return [{ key: `we-${we.id}`, name, sets: we.sets, reps: we.reps, additionId: null }];
        });
      const extra = (additionsByDay.get(day.id) ?? []).map((a) => ({
        key: `add-${a.id}`,
        name: a.exercises?.name ?? "—",
        sets: a.sets,
        reps: a.reps,
        additionId: a.id,
      }));
      return {
        id: day.id,
        letter: String.fromCharCode(64 + day.day_index),
        name: day.name,
        focus: day.focus,
        exercises: [...templateExercises, ...extra],
      };
    });

  return (
    <div className="mx-auto w-full max-w-md px-6 pt-8">
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Treino</h1>

      <div className="border-primary/20 relative mb-6 overflow-hidden rounded-3xl border p-6">
        <div
          aria-hidden
          className="bg-primary/20 pointer-events-none absolute -top-16 -right-10 size-56 rounded-full blur-[90px]"
        />
        <p className="text-muted-foreground relative text-sm font-medium">Sua ficha</p>
        <h2 className="relative mt-1 text-2xl font-bold tracking-tight text-balance">
          {template.name}
        </h2>
        <div className="text-muted-foreground relative mt-4 flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <Dumbbell className="size-4" />
            {template.days_per_week} dias/semana
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" />
            {template.session_duration_minutes} min
          </span>
        </div>
        {personalized && (
          <div className="text-primary relative mt-4 inline-flex items-center gap-1.5 text-xs font-medium">
            <Sparkles className="size-3.5" />
            Personalizada para você
          </div>
        )}
      </div>

      <FichaEditor days={days} catalog={pickerCatalog} />

      <div className="mt-6 flex justify-center">
        <GenerateWorkoutButton
          label="Gerar novamente"
          variant="ghost"
          className="text-muted-foreground"
        />
      </div>
    </div>
  );
}
