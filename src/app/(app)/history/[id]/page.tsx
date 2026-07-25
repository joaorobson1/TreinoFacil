import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Clock, Dumbbell, Weight } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import { formatDuration, formatVolume } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Detalhe do treino" };

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  const [{ data: workout }, { data: sets }] = await Promise.all([
    supabase
      .from("completed_workouts")
      .select("id, completed_at, duration_seconds, total_volume, workout_days(name)")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user_progress")
      .select("exercise_id, set_number, reps_done, weight_kg, exercises(name)")
      .eq("completed_workout_id", id)
      .eq("user_id", user.id)
      .order("set_number"),
  ]);

  if (!workout) notFound();

  // agrupa séries por exercício, preservando a ordem de aparição
  const order: string[] = [];
  const byExercise = new Map<string, { name: string; sets: { reps: number | null; weight: number | null }[] }>();
  for (const s of sets ?? []) {
    if (!byExercise.has(s.exercise_id)) {
      byExercise.set(s.exercise_id, { name: s.exercises?.name ?? "Exercício", sets: [] });
      order.push(s.exercise_id);
    }
    byExercise.get(s.exercise_id)!.sets.push({ reps: s.reps_done, weight: s.weight_kg });
  }

  const d = new Date(workout.completed_at);
  const dateLabel = d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

  const stats = [
    { icon: Dumbbell, label: "Exercícios", value: `${order.length}` },
    { icon: Clock, label: "Tempo", value: formatDuration(workout.duration_seconds) },
    { icon: Weight, label: "Volume", value: formatVolume(workout.total_volume) },
  ];

  return (
    <div className="mx-auto w-full max-w-md px-6 pt-6">
      <header className="mb-6 flex items-center gap-3">
        <Link href={ROUTES.history} aria-label="Voltar" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight">
            {workout.workout_days?.name ?? "Treino"}
          </h1>
          <p className="text-muted-foreground text-sm capitalize">{dateLabel}</p>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-2xl border p-4 text-center">
            <s.icon className="text-muted-foreground mx-auto size-4" />
            <div className="mt-1.5 text-base font-bold tabular-nums">{s.value}</div>
            <div className="text-muted-foreground text-[10px]">{s.label}</div>
          </div>
        ))}
      </div>

      {order.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhuma série registrada neste treino.
        </p>
      ) : (
        <div className="space-y-3">
          {order.map((exId, idx) => {
            const ex = byExercise.get(exId)!;
            return (
              <div key={exId} className="bg-card rounded-2xl border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold tabular-nums">
                    {idx + 1}
                  </span>
                  <p className="truncate font-medium">{ex.name}</p>
                </div>
                <div className="divide-border grid grid-cols-2 gap-x-6 gap-y-1 pl-9 text-sm sm:grid-cols-3">
                  {ex.sets.map((set, i) => (
                    <div key={i} className="flex items-center justify-between tabular-nums">
                      <span className="text-muted-foreground">{i + 1}ª</span>
                      <span className="font-medium">
                        {set.weight != null ? `${set.weight}kg` : "—"}
                        {set.reps != null && ` × ${set.reps}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
