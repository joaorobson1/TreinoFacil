import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Dumbbell, Clock, Sparkles } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import { GenerateWorkoutButton } from "@/components/workout/generate-workout-button";
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
      "id, workout_templates(name, split_type, days_per_week, session_duration_minutes, workout_days(id, day_index, name, focus, workout_exercises(id)))",
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

  // conta exercícios por dia descontando os removidos pelo Generator
  const { data: overrides } = await supabase
    .from("user_workout_overrides")
    .select("workout_exercise_id, substitute_exercise_id")
    .eq("user_workout_id", uw.id);
  const removed = new Set(
    (overrides ?? [])
      .filter((o) => !o.substitute_exercise_id)
      .map((o) => o.workout_exercise_id),
  );
  const personalized = (overrides ?? []).length > 0;

  const days = [...template.workout_days].sort(
    (a, b) => a.day_index - b.day_index,
  );

  return (
    <div className="mx-auto w-full max-w-md px-6 pt-8">
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Treino</h1>

      {/* Resumo da ficha */}
      <div className="border-primary/20 relative mb-6 overflow-hidden rounded-3xl border p-6">
        <div
          aria-hidden
          className="bg-primary/20 pointer-events-none absolute -top-16 -right-10 size-56 rounded-full blur-[90px]"
        />
        <p className="text-muted-foreground relative text-sm font-medium">
          Sua ficha
        </p>
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
            Personalizada para seus equipamentos e limitações
          </div>
        )}
      </div>

      {/* Dias */}
      <div className="space-y-3">
        {days.map((day) => {
          const count = day.workout_exercises.filter(
            (we) => !removed.has(we.id),
          ).length;
          const letter = String.fromCharCode(64 + day.day_index);
          return (
            <Link
              key={day.id}
              href={`${ROUTES.session}/${day.id}`}
              className="bg-card hover:border-foreground/20 flex items-center gap-4 rounded-2xl border p-4 transition-colors"
            >
              <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold">
                {letter}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{day.name}</p>
                {day.focus && (
                  <p className="text-muted-foreground truncate text-sm">
                    {day.focus}
                  </p>
                )}
              </div>
              <span className="text-muted-foreground shrink-0 text-sm">
                {count} exerc.
              </span>
              <ChevronRight className="text-muted-foreground size-5 shrink-0" />
            </Link>
          );
        })}
      </div>

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
