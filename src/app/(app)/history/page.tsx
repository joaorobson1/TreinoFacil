import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarDays, Clock } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import { EmptyState } from "@/components/shared/empty-state";
import { HistoryCalendar, WeeklyVolume } from "@/components/history/history-charts";
import { formatDuration, formatVolume } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Histórico" };

const dayKey = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const weekStart = (d: Date) => {
  const x = dayKey(d);
  x.setDate(x.getDate() - x.getDay());
  return x;
};
const iso = (d: Date) => d.toISOString().slice(0, 10);

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  const [{ data: stats }, { data: completed }] = await Promise.all([
    supabase
      .from("user_stats")
      .select("total_workouts, total_volume_kg, total_duration_seconds")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("completed_workouts")
      .select("id, completed_at, duration_seconds, total_volume, workout_days(name)")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(200),
  ]);

  const sessions = completed ?? [];

  if (sessions.length === 0) {
    return (
      <div className="mx-auto w-full max-w-md px-6 pt-8">
        <h1 className="mb-2 text-2xl font-bold tracking-tight">Histórico</h1>
        <EmptyState
          icon={CalendarDays}
          title="Nenhum treino concluído"
          description="Conclua seu primeiro treino e ele aparecerá aqui, com calendário de frequência e volume semanal."
        />
      </div>
    );
  }

  // mapa por dia (para o heatmap) e por semana (para o volume)
  const byDay = new Map<string, number>();
  const byWeek = new Map<number, number>();
  const trainedDays = new Set<string>();
  for (const s of sessions) {
    const d = new Date(s.completed_at);
    const k = iso(dayKey(d));
    trainedDays.add(k);
    byDay.set(k, (byDay.get(k) ?? 0) + Number(s.total_volume ?? 0));
    const w = weekStart(d).getTime();
    byWeek.set(w, (byWeek.get(w) ?? 0) + Number(s.total_volume ?? 0));
  }

  // heatmap: 13 semanas até hoje (colunas de 7 dias, começando no domingo)
  const today = dayKey(new Date());
  const start = weekStart(new Date(today.getTime() - 12 * 7 * 86_400_000));
  const weeks: { date: string; level: number }[][] = [];
  const cur = new Date(start);
  while (cur <= today) {
    const col: { date: string; level: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const k = iso(cur);
      const vol = byDay.get(k);
      const level =
        cur > today ? -1 : !vol ? 0 : vol >= 5000 ? 4 : vol >= 3000 ? 3 : vol >= 1000 ? 2 : 1;
      col.push({ date: k, level });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(col);
  }

  // volume das últimas 8 semanas
  const thisWeek = weekStart(new Date());
  const weekly = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(thisWeek.getTime() - (7 - i) * 7 * 86_400_000);
    return { label: `${d.getDate()}/${d.getMonth() + 1}`, volume: byWeek.get(d.getTime()) ?? 0 };
  });

  const summary = [
    { label: "Treinos", value: `${stats?.total_workouts ?? sessions.length}` },
    { label: "Dias treinados", value: `${trainedDays.size}` },
    { label: "Volume total", value: formatVolume(stats?.total_volume_kg) },
    { label: "Tempo total", value: formatDuration(stats?.total_duration_seconds) },
  ];

  return (
    <div className="mx-auto w-full max-w-md px-6 pt-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Histórico</h1>

      <div className="mb-6 grid grid-cols-2 gap-3">
        {summary.map((s) => (
          <div key={s.label} className="bg-card rounded-2xl border p-4">
            <div className="text-2xl font-bold tabular-nums">{s.value}</div>
            <div className="text-muted-foreground text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      <section className="bg-card mb-6 rounded-2xl border p-5">
        <p className="mb-3 text-sm font-semibold">Frequência</p>
        <HistoryCalendar weeks={weeks} />
      </section>

      <section className="bg-card mb-6 rounded-2xl border p-5">
        <p className="mb-4 text-sm font-semibold">Volume semanal</p>
        <WeeklyVolume weeks={weekly} />
      </section>

      <section>
        <p className="mb-3 text-sm font-semibold">Treinos recentes</p>
        <div className="space-y-2">
          {sessions.slice(0, 12).map((s) => {
            const d = new Date(s.completed_at);
            return (
              <div
                key={s.id}
                className="bg-card flex items-center gap-3 rounded-2xl border p-4"
              >
                <div className="bg-primary/10 text-primary flex size-11 shrink-0 flex-col items-center justify-center rounded-xl leading-none">
                  <span className="text-base font-bold tabular-nums">{d.getDate()}</span>
                  <span className="text-[10px] uppercase">
                    {d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.workout_days?.name ?? "Treino"}</p>
                  <p className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Clock className="size-3.5" />
                    {formatDuration(s.duration_seconds)} · {formatVolume(s.total_volume)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
