import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LineChart, TrendingUp } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import { EmptyState } from "@/components/shared/empty-state";
import { formatWeight } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Progresso" };

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  const { data: rows } = await supabase
    .from("exercise_progress")
    .select("exercise_id, performed_on, top_weight_kg, best_e1rm, exercises(name)")
    .eq("user_id", user.id)
    .order("performed_on", { ascending: false })
    .limit(500);

  const map = new Map<
    string,
    { name: string; bestWeight: number; bestE1rm: number; last: string; sessions: number }
  >();
  for (const r of rows ?? []) {
    const cur = map.get(r.exercise_id);
    if (!cur) {
      map.set(r.exercise_id, {
        name: r.exercises?.name ?? "Exercício",
        bestWeight: Number(r.top_weight_kg ?? 0),
        bestE1rm: Number(r.best_e1rm ?? 0),
        last: r.performed_on,
        sessions: 1,
      });
    } else {
      cur.bestWeight = Math.max(cur.bestWeight, Number(r.top_weight_kg ?? 0));
      cur.bestE1rm = Math.max(cur.bestE1rm, Number(r.best_e1rm ?? 0));
      cur.sessions++;
    }
  }
  const list = [...map.values()].sort((a, b) => b.bestE1rm - a.bestE1rm);

  return (
    <div className="mx-auto w-full max-w-md px-6 pt-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Progresso</h1>

      {list.length === 0 ? (
        <EmptyState
          icon={LineChart}
          title="Sem dados ainda"
          description="Registre a carga e as repetições durante os treinos para acompanhar sua evolução por exercício."
        />
      ) : (
        <>
          <p className="text-muted-foreground mb-3 text-sm font-semibold">
            Recordes por exercício
          </p>
          <div className="space-y-2">
            {list.map((e) => (
              <div
                key={e.name}
                className="bg-card flex items-center gap-3 rounded-2xl border p-4"
              >
                <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
                  <TrendingUp className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{e.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {e.sessions} {e.sessions === 1 ? "sessão" : "sessões"}
                    {e.bestE1rm > 0 && ` · 1RM est. ${formatWeight(e.bestE1rm)}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-bold tabular-nums">
                    {e.bestWeight > 0 ? formatWeight(e.bestWeight) : "—"}
                  </p>
                  <p className="text-muted-foreground text-[10px]">melhor carga</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
