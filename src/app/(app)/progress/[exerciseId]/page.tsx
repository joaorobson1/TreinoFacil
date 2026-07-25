import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import { TrendChart } from "@/components/shared/trend-chart";
import { formatWeight } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Evolução do exercício" };

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(iso));

export default async function ExerciseProgressPage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const { exerciseId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  const [{ data: exercise }, { data: rows }] = await Promise.all([
    supabase.from("exercises").select("name").eq("id", exerciseId).maybeSingle(),
    supabase
      .from("exercise_progress")
      .select("performed_on, top_weight_kg, best_e1rm, total_sets, total_reps, total_volume")
      .eq("user_id", user.id)
      .eq("exercise_id", exerciseId)
      .order("performed_on", { ascending: true })
      .limit(200),
  ]);

  if (!exercise) notFound();
  const history = rows ?? [];
  if (history.length === 0) redirect(ROUTES.progress);

  const weightPoints = history
    .filter((h) => h.top_weight_kg != null)
    .map((h) => ({ label: fmtDate(h.performed_on), value: Number(h.top_weight_kg) }));

  const bestWeight = Math.max(0, ...history.map((h) => Number(h.top_weight_kg ?? 0)));
  const bestE1rm = Math.max(0, ...history.map((h) => Number(h.best_e1rm ?? 0)));

  const stats = [
    { label: "Melhor carga", value: bestWeight > 0 ? formatWeight(bestWeight) : "—" },
    { label: "1RM estimado", value: bestE1rm > 0 ? formatWeight(bestE1rm) : "—" },
    { label: "Sessões", value: String(history.length) },
  ];

  return (
    <div className="mx-auto w-full max-w-md px-6 pt-6">
      <header className="mb-6 flex items-center gap-3">
        <Link href={ROUTES.progress} aria-label="Voltar" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="truncate text-xl font-bold tracking-tight">{exercise.name}</h1>
      </header>

      <div className="bg-card mb-4 rounded-2xl border p-5">
        <p className="text-muted-foreground mb-1 text-xs">Evolução da carga</p>
        <TrendChart points={weightPoints} unit="kg" />
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-2xl border p-4 text-center">
            <div className="text-lg font-bold tabular-nums">{s.value}</div>
            <div className="text-muted-foreground text-[10px]">{s.label}</div>
          </div>
        ))}
      </div>

      <p className="text-muted-foreground mb-2 text-sm font-semibold">Histórico</p>
      <div className="space-y-2">
        {[...history].reverse().map((h, i) => (
          <div key={i} className="bg-card flex items-center justify-between rounded-2xl border p-4">
            <div>
              <p className="font-medium tabular-nums">
                {h.top_weight_kg != null ? formatWeight(h.top_weight_kg) : "—"}
              </p>
              <p className="text-muted-foreground text-xs">{fmtDate(h.performed_on)}</p>
            </div>
            <div className="text-muted-foreground text-right text-xs">
              <p className="text-foreground font-medium tabular-nums">
                {h.total_sets ?? 0} ×{" "}
                {(h.total_reps ?? 0) > 0
                  ? Math.round((h.total_reps ?? 0) / Math.max(1, h.total_sets ?? 1))
                  : 0}
              </p>
              <p>séries × reps méd.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
