"use client";

import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExerciseMedia } from "./exercise-media";
import { cn } from "@/lib/utils";
import type { LoggedSet, SessionExercise } from "./types";

function InfoSection({
  title,
  content,
  defaultOpen = false,
}: {
  title: string;
  content: string | null;
  defaultOpen?: boolean;
}) {
  if (!content) return null;
  return (
    <details open={defaultOpen} className="group border-border/70 border-t py-3">
      <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
        {title}
        <ChevronDown className="text-muted-foreground size-4 transition-transform group-open:rotate-180" />
      </summary>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed whitespace-pre-line">
        {content}
      </p>
    </details>
  );
}

export function ExerciseScreen({
  exercise,
  sets,
  index,
  total,
  onChangeSet,
  onToggleDone,
  onBack,
  onComplete,
  isLast,
}: {
  exercise: SessionExercise;
  sets: LoggedSet[];
  index: number;
  total: number;
  onChangeSet: (setIdx: number, patch: Partial<LoggedSet>) => void;
  onToggleDone: (setIdx: number) => void;
  onBack: () => void;
  onComplete: () => void;
  isLast: boolean;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-6 pb-28">
      {/* topo */}
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={onBack} aria-label="Voltar">
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex-1">
          <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
        </div>
        <span className="text-muted-foreground text-sm font-medium tabular-nums">
          {index + 1}/{total}
        </span>
      </div>

      <ExerciseMedia media={exercise.media} label={exercise.muscles[0]?.name ?? "Exercício"} />

      <h1 className="mt-5 text-2xl font-bold tracking-tight text-balance">
        {exercise.name}
      </h1>
      <div className="text-muted-foreground mt-2 flex flex-wrap gap-2 text-sm">
        <span className="bg-muted rounded-full px-3 py-1 font-medium">
          {exercise.targetSets} × {exercise.targetReps}
        </span>
        <span className="bg-muted rounded-full px-3 py-1 font-medium">
          descanso {exercise.restSeconds}s
        </span>
      </div>

      {/* séries */}
      <div className="mt-6">
        <p className="mb-2 text-sm font-semibold">Séries</p>
        <div className="space-y-2">
          {sets.map((set, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 rounded-2xl border p-2.5 transition-colors",
                set.done ? "border-primary/40 bg-primary/5" : "border-border",
              )}
            >
              <span className="text-muted-foreground w-6 text-center text-sm font-semibold tabular-nums">
                {i + 1}
              </span>
              <div className="relative flex-1">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={set.weight}
                  onChange={(e) => onChangeSet(i, { weight: e.target.value })}
                  className="h-11 rounded-xl pr-9 text-center"
                />
                <span className="text-muted-foreground pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs">
                  kg
                </span>
              </div>
              <div className="relative flex-1">
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={set.reps}
                  onChange={(e) => onChangeSet(i, { reps: e.target.value })}
                  className="h-11 rounded-xl pr-12 text-center"
                />
                <span className="text-muted-foreground pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs">
                  reps
                </span>
              </div>
              <button
                type="button"
                onClick={() => onToggleDone(i)}
                aria-label="Concluir série"
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl border transition-colors",
                  set.done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                <Check className="size-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* instruções */}
      <div className="mt-6">
        <InfoSection title="Como executar" content={exercise.execution} defaultOpen />
        {exercise.muscles.length > 0 && (
          <details className="group border-border/70 border-t py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
              Músculos utilizados
              <ChevronDown className="text-muted-foreground size-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-2 flex flex-wrap gap-2">
              {exercise.muscles.map((m) => (
                <span
                  key={m.name}
                  className={cn(
                    "rounded-full px-3 py-1 text-sm font-medium",
                    m.role === "primary"
                      ? "bg-primary/15 text-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {m.name}
                </span>
              ))}
            </div>
          </details>
        )}
        <InfoSection title="Respiração" content={exercise.breathing} />
        <InfoSection title="Erros comuns" content={exercise.commonMistakes} />
        <InfoSection title="Dicas" content={exercise.tips} />
      </div>

      {/* concluir */}
      <div className="bg-background/80 fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur-xl">
        <div className="mx-auto max-w-md px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button onClick={onComplete} className="h-12 w-full rounded-2xl text-base font-semibold">
            {isLast ? "Ver resumo" : "Concluir exercício"}
          </Button>
        </div>
      </div>
    </div>
  );
}
