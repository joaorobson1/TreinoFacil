"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import {
  addWorkoutExerciseAction,
  removeWorkoutExerciseAction,
} from "@/actions/ficha.actions";

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

const selectCls =
  "border-input bg-background h-10 min-w-0 flex-1 rounded-lg border px-2 text-sm outline-none focus-visible:border-ring";

function DayCard({
  day,
  catalog,
}: {
  day: EditorDay;
  catalog: { id: string; name: string }[];
}) {
  const router = useRouter();
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
    <div className="bg-card rounded-2xl border p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold">
          {day.letter}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{day.name}</p>
          {day.focus && <p className="text-muted-foreground truncate text-xs">{day.focus}</p>}
        </div>
        <span className="text-muted-foreground shrink-0 text-xs">
          {day.exercises.length} exerc.
        </span>
      </div>

      <div className="divide-border divide-y">
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
          <select value={exId} onChange={(e) => setExId(e.target.value)} className={`${selectCls} w-full`}>
            <option value="">Escolha um exercício...</option>
            {catalog.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
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
  );
}

export function FichaEditor({
  days,
  catalog,
}: {
  days: EditorDay[];
  catalog: { id: string; name: string }[];
}) {
  return (
    <div className="space-y-3">
      {days.map((day) => (
        <DayCard key={day.id} day={day} catalog={catalog} />
      ))}
    </div>
  );
}
