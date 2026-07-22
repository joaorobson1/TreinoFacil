import Link from "next/link";
import { ArrowRight, Clock, Dumbbell, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export type TodayWorkout = {
  dayId: string;
  dayName: string;
  focus: string | null;
  exerciseCount: number;
  durationMin: number | null;
} | null;

export function TodayWorkoutCard({ workout }: { workout: TodayWorkout }) {
  return (
    <div className="border-primary/20 relative overflow-hidden rounded-3xl border p-6">
      <div
        aria-hidden
        className="bg-primary/20 pointer-events-none absolute -top-16 -right-10 size-56 rounded-full blur-[90px]"
      />
      <p className="text-muted-foreground relative text-sm font-medium">
        Treino de hoje
      </p>

      {workout ? (
        <div className="relative">
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-balance">
            {workout.dayName}
          </h2>
          {workout.focus && (
            <p className="text-muted-foreground mt-1 text-sm">{workout.focus}</p>
          )}
          <div className="text-muted-foreground mt-4 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <Dumbbell className="size-4" />
              {workout.exerciseCount} exercícios
            </span>
            {workout.durationMin && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {workout.durationMin} min
              </span>
            )}
          </div>
          <Link
            href={`${ROUTES.session}/${workout.dayId}`}
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-6 h-12 w-full rounded-2xl text-base font-semibold",
            )}
          >
            Iniciar treino
            <ArrowRight className="size-5" />
          </Link>
        </div>
      ) : (
        <div className="relative">
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-balance">
            Sua ficha está a caminho
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Assim que seu plano personalizado for gerado, o treino do dia aparece
            aqui — pronto para começar.
          </p>
          <div className="text-muted-foreground/80 mt-5 inline-flex items-center gap-2 text-xs">
            <Sparkles className="text-primary size-4" />
            Montado por regras a partir do seu perfil
          </div>
        </div>
      )}
    </div>
  );
}
