import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Check, Layers, Lock } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import { getUserProgram } from "@/infrastructure/workout/get-user-program";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Programa" };

export default async function ProgramsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  const program = await getUserProgram(supabase, user.id);

  if (!program) {
    return (
      <div className="mx-auto w-full max-w-md px-6 pt-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Programa</h1>
        <EmptyState
          icon={Layers}
          title="Você não está em um programa"
          description="Sua ficha atual funciona normalmente. Programas evoluem sua ficha em fases automaticamente conforme você treina — quando um estiver disponível para o seu objetivo, você entra nele ao gerar o treino."
        />
      </div>
    );
  }

  const { progress } = program;
  const pct = progress.target > 0 ? Math.round((progress.done / progress.target) * 100) : 0;
  const remaining = Math.max(0, progress.target - progress.done);

  return (
    <div className="mx-auto w-full max-w-md px-6 pt-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Programa</h1>

      <div className="border-primary/20 relative mb-6 overflow-hidden rounded-3xl border p-6">
        <div
          aria-hidden
          className="bg-primary/20 pointer-events-none absolute -top-16 -right-10 size-56 rounded-full blur-[90px]"
        />
        <p className="text-muted-foreground relative text-sm font-medium">Seu programa</p>
        <h2 className="relative mt-1 text-2xl font-bold tracking-tight text-balance">
          {program.programName}
        </h2>
        <p className="text-muted-foreground relative mt-1 text-sm">
          Fase {program.currentIndex} de {program.totalPhases}
        </p>

        <div className="relative mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {progress.kind === "weeks"
                ? `${progress.done} de ${progress.target} semanas`
                : `${progress.done} de ${progress.target} treinos`}
            </span>
            <span className="text-primary font-semibold">{pct}%</span>
          </div>
          <div className="bg-muted h-2.5 overflow-hidden rounded-full">
            <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            {remaining === 0
              ? "Você atingiu o critério — avança na próxima conclusão."
              : progress.kind === "weeks"
                ? `Faltam ~${remaining} semana(s) para avançar de fase.`
                : `Faltam ${remaining} treino(s) para avançar de fase.`}
          </p>
        </div>
      </div>

      <p className="text-muted-foreground mb-2 text-sm font-semibold">Fases</p>
      <div className="space-y-2">
        {program.phases.map((ph) => (
          <div
            key={ph.index}
            className={cn(
              "flex items-center gap-3 rounded-2xl border p-4",
              ph.status === "current" ? "border-primary/40 bg-primary/5" : "bg-card",
            )}
          >
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                ph.status === "done" && "bg-primary text-primary-foreground",
                ph.status === "current" && "bg-primary/15 text-primary",
                ph.status === "locked" && "bg-muted text-muted-foreground",
              )}
            >
              {ph.status === "done" ? (
                <Check className="size-4" />
              ) : ph.status === "locked" ? (
                <Lock className="size-3.5" />
              ) : (
                ph.index
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{ph.name}</p>
              <p className="text-muted-foreground text-xs">
                {ph.status === "done"
                  ? "Concluída"
                  : ph.status === "current"
                    ? "Em andamento"
                    : "Bloqueada"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
