"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Dumbbell, PartyPopper, Repeat2, Weight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ExerciseScreen } from "./exercise-screen";
import { RestTimer } from "./rest-timer";
import type { LoggedSet, SessionExercise } from "./types";
import { formatDuration, formatVolume } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import { completeWorkoutAction } from "@/actions/session.actions";

type Phase = "overview" | "running" | "summary";

function initialReps(target: string) {
  return target.match(/\d+/)?.[0] ?? "";
}
function toNum(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function SessionRunner({
  dayName,
  dayId,
  userWorkoutId,
  exercises,
}: {
  dayName: string;
  dayId: string;
  userWorkoutId: string;
  exercises: SessionExercise[];
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("overview");
  const [current, setCurrent] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [rest, setRest] = useState<{ open: boolean; seconds: number }>({
    open: false,
    seconds: 60,
  });
  const [sets, setSets] = useState<LoggedSet[][]>(() =>
    exercises.map((e) =>
      Array.from({ length: e.targetSets }, () => ({
        weight: "",
        reps: initialReps(e.targetReps),
        done: false,
      })),
    ),
  );

  const summary = useMemo(() => {
    let volume = 0;
    let doneSets = 0;
    for (const exSets of sets) {
      for (const s of exSets) {
        const w = toNum(s.weight);
        const r = toNum(s.reps);
        if (r != null || w != null) doneSets++;
        if (w != null && r != null) volume += w * r;
      }
    }
    return { volume, doneSets };
  }, [sets]);

  function changeSet(exIdx: number, setIdx: number, patch: Partial<LoggedSet>) {
    setSets((prev) =>
      prev.map((ex, i) =>
        i === exIdx ? ex.map((s, j) => (j === setIdx ? { ...s, ...patch } : s)) : ex,
      ),
    );
  }

  function toggleDone(setIdx: number) {
    const exSets = sets[current];
    const willBeDone = !exSets[setIdx].done;
    changeSet(current, setIdx, { done: willBeDone });
    // abre o descanso ao concluir uma série (menos a última do exercício)
    if (willBeDone && setIdx < exSets.length - 1) {
      setRest({ open: true, seconds: exercises[current].restSeconds });
    }
  }

  function completeExercise() {
    if (current < exercises.length - 1) {
      setCurrent((c) => c + 1);
      window.scrollTo({ top: 0 });
    } else {
      setPhase("summary");
      window.scrollTo({ top: 0 });
    }
  }

  function back() {
    if (current > 0) {
      setCurrent((c) => c - 1);
      window.scrollTo({ top: 0 });
    } else {
      setPhase("overview");
    }
  }

  async function finish() {
    setSubmitting(true);
    const result = await completeWorkoutAction({
      userWorkoutId,
      workoutDayId: dayId,
      durationSeconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
      entries: exercises.map((e, exIdx) => ({
        exerciseId: e.exerciseId,
        workoutExerciseId: e.workoutExerciseId,
        sets: sets[exIdx].map((s) => ({ weight: toNum(s.weight), reps: toNum(s.reps) })),
      })),
    });
    if (!result.ok) {
      setSubmitting(false);
      toast.error(result.error);
      return;
    }
    toast.success("Treino concluído! 💪");
    for (const a of result.value.unlocked) {
      toast(`🏆 ${a.name}`, {
        description: a.description ?? "Conquista desbloqueada!",
        duration: 6000,
      });
    }
    router.push(ROUTES.dashboard);
    router.refresh();
  }

  // ---------------- OVERVIEW ----------------
  if (phase === "overview") {
    return (
      <div className="mx-auto w-full max-w-md px-6 pt-6 pb-28">
        <div className="mb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => router.push(ROUTES.workout)}
            aria-label="Voltar"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <p className="text-muted-foreground text-sm">Treino de hoje</p>
            <h1 className="text-2xl font-bold tracking-tight">{dayName}</h1>
          </div>
        </div>

        <div className="space-y-2">
          {exercises.map((e, i) => (
            <div
              key={e.id}
              className="bg-card flex items-center gap-3 rounded-2xl border p-3"
            >
              <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold tabular-nums">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{e.name}</p>
                <p className="text-muted-foreground text-sm">
                  {e.targetSets} × {e.targetReps} · descanso {e.restSeconds}s
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-background/80 fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur-xl">
          <div className="mx-auto max-w-md px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button
              onClick={() => setPhase("running")}
              className="h-12 w-full rounded-2xl text-base font-semibold"
            >
              Iniciar treino
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- SUMMARY ----------------
  if (phase === "summary") {
    const stats = [
      { icon: Dumbbell, label: "Exercícios", value: `${exercises.length}` },
      { icon: Repeat2, label: "Séries", value: `${summary.doneSets}` },
      { icon: Weight, label: "Volume", value: formatVolume(summary.volume) },
      {
        icon: Clock,
        label: "Tempo",
        value: formatDuration(Math.round((Date.now() - startedAt) / 1000)),
      },
    ];
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-10 pb-8">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="bg-primary/10 text-primary flex size-20 items-center justify-center rounded-3xl">
            <PartyPopper className="size-9" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Treino concluído!</h1>
          <p className="text-muted-foreground mt-2">{dayName}</p>

          <div className="mt-8 grid w-full grid-cols-2 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-card rounded-2xl border p-4 text-left">
                <s.icon className="text-muted-foreground size-5" />
                <div className="mt-2 text-2xl font-bold tabular-nums">{s.value}</div>
                <div className="text-muted-foreground text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-2">
          <Button
            onClick={finish}
            disabled={submitting}
            className="h-12 w-full rounded-2xl text-base font-semibold"
          >
            {submitting ? "Salvando..." : "Concluir treino"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setPhase("running")}
            className="h-11 w-full rounded-2xl"
          >
            Voltar aos exercícios
          </Button>
        </div>
      </div>
    );
  }

  // ---------------- RUNNING ----------------
  return (
    <>
      <ExerciseScreen
        exercise={exercises[current]}
        sets={sets[current]}
        index={current}
        total={exercises.length}
        onChangeSet={(setIdx, patch) => changeSet(current, setIdx, patch)}
        onToggleDone={toggleDone}
        onBack={back}
        onComplete={completeExercise}
        isLast={current === exercises.length - 1}
      />
      <RestTimer
        open={rest.open}
        seconds={rest.seconds}
        onDismiss={() => setRest((r) => ({ ...r, open: false }))}
      />
    </>
  );
}
