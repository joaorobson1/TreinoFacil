import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Scale } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import { EmptyState } from "@/components/shared/empty-state";
import { TrendChart } from "@/components/shared/trend-chart";
import { AddMeasurement } from "@/components/measurements/add-measurement";
import { formatWeight, formatWeightDelta } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Medidas" };

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(
    new Date(iso),
  );

export default async function MeasurementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  const { data: rows } = await supabase
    .from("body_measurements")
    .select("id, measured_at, weight_kg, waist_cm, body_fat_pct, bmi")
    .eq("user_id", user.id)
    .order("measured_at", { ascending: true })
    .limit(200);

  const measurements = rows ?? [];
  const withWeight = measurements.filter((m) => m.weight_kg != null);
  const first = withWeight[0];
  const latest = withWeight[withWeight.length - 1];
  const delta =
    first && latest ? Number(latest.weight_kg) - Number(first.weight_kg) : 0;

  const points = withWeight.map((m) => ({
    label: fmtDate(m.measured_at),
    value: Number(m.weight_kg),
  }));

  return (
    <div className="mx-auto w-full max-w-md px-6 pt-8 pb-4">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Medidas</h1>

      {measurements.length === 0 ? (
        <div className="space-y-6">
          <EmptyState
            icon={Scale}
            title="Nenhuma medida ainda"
            description="Registre seu peso periodicamente para acompanhar sua evolução ao longo do tempo."
          />
          <AddMeasurement />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-card rounded-2xl border p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Peso atual</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold tabular-nums">
                    {formatWeight(latest?.weight_kg)}
                  </p>
                  {delta !== 0 && (
                    <span
                      className={
                        delta < 0 ? "text-primary text-sm" : "text-muted-foreground text-sm"
                      }
                    >
                      {formatWeightDelta(delta)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs">IMC</p>
                <p className="text-3xl font-bold tabular-nums">{latest?.bmi ?? "—"}</p>
              </div>
            </div>
            <div className="mt-5">
              <TrendChart points={points} unit="kg" />
            </div>
          </div>

          <AddMeasurement lastWeight={latest?.weight_kg} />

          <div>
            <p className="text-muted-foreground mb-2 text-sm font-semibold">Histórico</p>
            <div className="space-y-2">
              {[...measurements].reverse().map((m) => (
                <div
                  key={m.id}
                  className="bg-card flex items-center justify-between rounded-2xl border p-4"
                >
                  <div>
                    <p className="font-medium tabular-nums">{formatWeight(m.weight_kg)}</p>
                    <p className="text-muted-foreground text-xs">{fmtDate(m.measured_at)}</p>
                  </div>
                  <div className="text-muted-foreground flex gap-4 text-right text-xs">
                    {m.waist_cm != null && (
                      <div>
                        <p className="text-foreground font-medium tabular-nums">{m.waist_cm} cm</p>
                        <p>cintura</p>
                      </div>
                    )}
                    {m.body_fat_pct != null && (
                      <div>
                        <p className="text-foreground font-medium tabular-nums">{m.body_fat_pct}%</p>
                        <p>gordura</p>
                      </div>
                    )}
                    {m.bmi != null && (
                      <div>
                        <p className="text-foreground font-medium tabular-nums">{m.bmi}</p>
                        <p>IMC</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
