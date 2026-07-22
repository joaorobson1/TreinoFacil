import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Clock, Dumbbell, Layers, Repeat2, Trophy } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import { getTodaysWorkout } from "@/infrastructure/workout/get-todays-workout";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { StatTile } from "@/components/dashboard/stat-tile";
import { StreakRing } from "@/components/dashboard/streak-ring";
import { TodayWorkoutCard } from "@/components/dashboard/today-workout-card";
import {
  formatDuration,
  formatNumber,
  formatToday,
  formatWeight,
  formatWeightDelta,
  greeting,
} from "@/lib/format";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Início" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  const [{ data: account }, { data: profile }, { data: stats }, { data: measurement }] =
    await Promise.all([
      supabase.from("users").select("name").eq("id", user.id).single(),
      supabase
        .from("profiles")
        .select("weight_kg, goals(name)")
        .eq("user_id", user.id)
        .single(),
      supabase.from("user_stats").select("*").eq("user_id", user.id).single(),
      supabase
        .from("body_measurements")
        .select("weight_kg, bmi")
        .eq("user_id", user.id)
        .order("measured_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const firstName = account?.name?.split(" ")[0] ?? "atleta";
  const initial = firstName.charAt(0).toUpperCase();
  const goalName = profile?.goals?.name ?? "—";

  const baseline = profile?.weight_kg ?? null;
  const weightNow = measurement?.weight_kg ?? baseline;
  const weightDelta =
    weightNow != null && baseline != null ? Number(weightNow) - Number(baseline) : 0;

  const streak = stats?.current_streak ?? 0;
  const record = stats?.longest_streak ?? 0;

  const today = await getTodaysWorkout(supabase, user.id);

  const [{ count: totalAch }, { count: ownedAch }] = await Promise.all([
    supabase
      .from("achievements")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("user_achievements")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-md px-6 pt-6">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{formatToday()}</p>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting()}, {firstName}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href={ROUTES.profile}
            aria-label="Perfil"
            className="bg-muted text-foreground flex size-10 items-center justify-center rounded-full font-semibold"
          >
            {initial}
          </Link>
        </div>
      </header>

      <div className="space-y-4">
        <TodayWorkoutCard workout={today} />

        <StreakRing streak={streak} record={record} />

        <div className="grid grid-cols-2 gap-4">
          <StatTile
            icon={Dumbbell}
            label="Treinos concluídos"
            value={formatNumber(stats?.total_workouts)}
          />
          <StatTile
            icon={Layers}
            label="Séries realizadas"
            value={formatNumber(stats?.total_sets)}
          />
          <StatTile
            icon={Repeat2}
            label="Repetições"
            value={formatNumber(stats?.total_reps)}
          />
          <StatTile
            icon={Clock}
            label="Tempo treinado"
            value={formatDuration(stats?.total_duration_seconds)}
          />
        </div>

        <div className="bg-card rounded-2xl border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs">Peso atual</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold tabular-nums">
                  {formatWeight(weightNow)}
                </p>
                {weightDelta !== 0 && (
                  <span className="text-muted-foreground text-xs">
                    {formatWeightDelta(weightDelta)}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs">IMC</p>
              <p className="text-2xl font-bold tabular-nums">
                {measurement?.bmi ?? "—"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
            <span className="text-muted-foreground">Objetivo</span>
            <span className="font-medium">{goalName}</span>
          </div>
        </div>

        <Link
          href={ROUTES.achievements}
          className="bg-card hover:border-foreground/20 flex items-center gap-3 rounded-2xl border p-4 transition-colors"
        >
          <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
            <Trophy className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Conquistas</p>
            <p className="text-muted-foreground text-sm">
              {ownedAch ?? 0} de {totalAch ?? 0} desbloqueadas
            </p>
          </div>
          <ChevronRight className="text-muted-foreground size-5 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
