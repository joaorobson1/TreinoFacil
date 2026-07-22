import type { Metadata } from "next";
import { Activity, Dumbbell, TrendingUp, Users } from "lucide-react";
import { getAdminAnalytics } from "@/infrastructure/admin/analytics";

export const metadata: Metadata = { title: "Admin · Dashboard" };

function RankList({
  rows,
  empty,
}: {
  rows: { name: string; count: number }[];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="text-muted-foreground text-sm">{empty}</p>;
  }
  const max = Math.max(...rows.map((r) => r.count));
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.name} className="flex items-center gap-3">
          <span className="w-40 shrink-0 truncate text-sm">{r.name}</span>
          <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${(r.count / max) * 100}%` }}
            />
          </div>
          <span className="text-muted-foreground w-8 shrink-0 text-right text-sm tabular-nums">
            {r.count}
          </span>
        </div>
      ))}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const a = await getAdminAnalytics();
  const maxNew = Math.max(1, ...a.newUsers.map((w) => w.count));

  const kpis = [
    { icon: Users, label: "Usuários", value: `${a.totalUsers}` },
    { icon: Activity, label: "Ativos (7d)", value: `${a.active7d}` },
    { icon: Dumbbell, label: "Treinos concluídos", value: `${a.totalCompleted}` },
    { icon: TrendingUp, label: "Frequência média", value: `${a.avgFrequency}` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="bg-card rounded-2xl border p-4">
            <k.icon className="text-muted-foreground size-5" />
            <div className="mt-3 text-2xl font-bold tabular-nums">{k.value}</div>
            <div className="text-muted-foreground text-xs">{k.label}</div>
          </div>
        ))}
      </div>

      <section className="bg-card rounded-2xl border p-5">
        <p className="mb-1 text-sm font-semibold">Evolução da base</p>
        <p className="text-muted-foreground mb-4 text-xs">
          Novos usuários por semana · {a.active30d} ativos em 30 dias
        </p>
        <div className="flex h-24 items-end justify-between gap-1.5">
          {a.newUsers.map((w, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="bg-primary/70 w-full rounded-t-md"
                  style={{ height: `${Math.max(3, (w.count / maxNew) * 100)}%` }}
                />
              </div>
              <span className="text-muted-foreground text-[10px] tabular-nums">
                {w.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card rounded-2xl border p-5">
        <p className="mb-4 text-sm font-semibold">Exercícios mais usados</p>
        <RankList rows={a.topExercises} empty="Sem dados de execução ainda." />
      </section>

      <section className="bg-card rounded-2xl border p-5">
        <p className="mb-4 text-sm font-semibold">Fichas mais atribuídas</p>
        <RankList rows={a.topTemplates} empty="Nenhuma ficha atribuída ainda." />
      </section>
    </div>
  );
}
