"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import {
  addWorkoutExerciseAction,
  removeWorkoutExerciseAction,
} from "@/actions/ficha.actions";
import { type PickerExercise, ExercisePicker } from "./exercise-picker";

export type EditorExercise = {
  key: string;
  name: string;
  sets: number;
  reps: string;
  additionId: string | null;
};
export type EditorDay = {
  id: string;
  letter: string;
  name: string;
  focus: string | null;
  exercises: EditorExercise[];
};

function DayCard({
  day,
  catalog,
}: {
  day: EditorDay;
  catalog: PickerExercise[];
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const [exId, setExId] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("12");
  const [rest, setRest] = useState("60");
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  async function add() {
    if (!exId) return toast.error("Escolha um exercício.");
    setBusy(true);
    const res = await addWorkoutExerciseAction(day.id, {
      exerciseId: exId,
      sets: Number(sets),
      reps,
      rest: Number(rest),
    });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    setExId("");
    setOpen(false);
    toast.success("Exercício adicionado.");
    router.refresh();
  }

  async function remove(additionId: string) {
    setRemoving(additionId);
    const res = await removeWorkoutExerciseAction(additionId);
    if (!res.ok) {
      setRemoving(null);
      return toast.error(res.error);
    }
    router.refresh();
  }

  return (
    <div className="bg-card overflow-hidden rounded-2xl border">
      {/* Cabeçalho (toca para abrir/fechar) */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 p-4 text-left"
        aria-expanded={expanded}
      >
        <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold">
          {day.letter}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{day.name}</p>
          <p className="text-muted-foreground truncate text-sm">
            {day.focus ? `${day.focus} · ` : ""}
            {day.exercises.length} exercícios
          </p>
        </div>
        <ChevronDown
          className={cn(
            "text-muted-foreground size-5 shrink-0 transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {/* Conteúdo do card */}
      {expanded && (
        <div className="px-4 pb-4">
          <div className="divide-border border-border/60 divide-y border-t">
            {day.exercises.map((e) => (
              <div key={e.key} className="flex items-center gap-2 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {e.name}
                    {e.additionId && (
                      <span className="text-primary ml-1.5 text-[10px] font-semibold">
                        adicionado
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {e.sets} × {e.reps}
                  </p>
                </div>
                {e.additionId && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive size-8 rounded-lg"
                    onClick={() => remove(e.additionId!)}
                    disabled={removing === e.additionId}
                    aria-label="Remover"
                  >
                    {removing === e.additionId ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <X className="size-4" />
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {open ? (
            <div className="bg-muted/40 mt-3 space-y-2 rounded-xl p-2.5">
              <ExercisePicker catalog={catalog} value={exId} onChange={setExId} />
              <div className="flex items-center gap-1.5">
                <Input value={sets} onChange={(e) => setSets(e.target.value)} className="h-10 w-14 rounded-lg px-1 text-center" aria-label="séries" />
                <span className="text-muted-foreground text-xs">×</span>
                <Input value={reps} onChange={(e) => setReps(e.target.value)} className="h-10 w-16 rounded-lg px-1 text-center" aria-label="reps" />
                <Input value={rest} onChange={(e) => setRest(e.target.value)} className="h-10 w-14 rounded-lg px-1 text-center" aria-label="descanso" />
                <span className="text-muted-foreground text-xs">s</span>
                <Button className="h-10 flex-1 rounded-lg" onClick={add} disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : "Adicionar"}
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="text-muted-foreground hover:text-foreground mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed py-2 text-sm font-medium"
            >
              <Plus className="size-4" />
              Adicionar exercício
            </button>
          )}

          <Link
            href={`${ROUTES.session}/${day.id}`}
            className={cn(buttonVariants(), "mt-3 h-11 w-full rounded-xl font-semibold")}
          >
            Iniciar treino
            <ArrowRight className="size-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

export function FichaEditor({
  days,
  catalog,
}: {
  days: EditorDay[];
  catalog: PickerExercise[];
}) {
  return (
    <div className="space-y-3">
      {days.map((day) => (
        <DayCard key={day.id} day={day} catalog={catalog} />
      ))}
    </div>
  );
}
