"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addDayAction,
  addDayExerciseAction,
  deleteDayAction,
  deleteDayExerciseAction,
  updateDayAction,
  updateDayExerciseAction,
} from "@/actions/admin/template.actions";

export type CatalogItem = { id: string; name: string };
export type WE = { id: string; sets: number; reps: string; rest: number; name: string };
export type DayData = { id: string; name: string; focus: string; exercises: WE[] };

const selectCls =
  "border-input bg-background h-10 rounded-lg border px-2 text-sm outline-none focus-visible:border-ring";

function ExerciseRow({ templateId, we }: { templateId: string; we: WE }) {
  const router = useRouter();
  const [sets, setSets] = useState(String(we.sets));
  const [reps, setReps] = useState(we.reps);
  const [rest, setRest] = useState(String(we.rest));
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const res = await updateDayExerciseAction(we.id, templateId, {
      sets: Number(sets), reps, rest: Number(rest),
    });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    router.refresh();
  }
  async function remove() {
    const res = await deleteDayExerciseAction(we.id, templateId);
    if (!res.ok) return toast.error(res.error);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1.5 py-1.5">
      <span className="min-w-0 flex-1 truncate text-sm">{we.name}</span>
      <Input value={sets} onChange={(e) => setSets(e.target.value)} className="h-9 w-12 rounded-lg px-1 text-center" aria-label="séries" />
      <span className="text-muted-foreground text-xs">×</span>
      <Input value={reps} onChange={(e) => setReps(e.target.value)} className="h-9 w-14 rounded-lg px-1 text-center" aria-label="reps" />
      <Input value={rest} onChange={(e) => setRest(e.target.value)} className="h-9 w-12 rounded-lg px-1 text-center" aria-label="descanso" />
      <Button size="icon" variant="ghost" className="size-9 rounded-lg" onClick={save} disabled={busy} aria-label="Salvar">
        <Check className="size-4" />
      </Button>
      <Button size="icon" variant="ghost" className="text-destructive size-9 rounded-lg" onClick={remove} aria-label="Remover">
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

function DayCard({
  templateId,
  day,
  catalog,
}: {
  templateId: string;
  day: DayData;
  catalog: CatalogItem[];
}) {
  const router = useRouter();
  const [name, setName] = useState(day.name);
  const [focus, setFocus] = useState(day.focus);
  const [exId, setExId] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("12");
  const [rest, setRest] = useState("60");
  const [busy, setBusy] = useState(false);

  async function saveDay() {
    const res = await updateDayAction(day.id, templateId, { name, focus });
    if (!res.ok) return toast.error(res.error);
    router.refresh();
  }
  async function removeDay() {
    const res = await deleteDayAction(day.id, templateId);
    if (!res.ok) return toast.error(res.error);
    router.refresh();
  }
  async function addExercise() {
    if (!exId) return toast.error("Escolha um exercício.");
    setBusy(true);
    const res = await addDayExerciseAction(day.id, templateId, {
      exerciseId: exId, sets: Number(sets), reps, rest: Number(rest),
    });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    setExId("");
    router.refresh();
  }

  return (
    <div className="bg-card rounded-2xl border p-4">
      <div className="mb-2 flex items-center gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} onBlur={saveDay}
          className="h-9 flex-1 rounded-lg font-semibold" placeholder="Nome do dia" />
        <Button size="icon" variant="ghost" className="text-destructive size-9 rounded-lg" onClick={removeDay} aria-label="Excluir dia">
          <Trash2 className="size-4" />
        </Button>
      </div>
      <Input value={focus} onChange={(e) => setFocus(e.target.value)} onBlur={saveDay}
        className="mb-3 h-9 rounded-lg text-sm" placeholder="Foco (ex.: Peito e Tríceps)" />

      <div className="divide-border divide-y">
        {day.exercises.map((we) => (
          <ExerciseRow key={we.id} templateId={templateId} we={we} />
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <select value={exId} onChange={(e) => setExId(e.target.value)} className={`${selectCls} min-w-0 flex-1`}>
          <option value="">+ exercício...</option>
          {catalog.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Input value={sets} onChange={(e) => setSets(e.target.value)} className="h-10 w-12 rounded-lg px-1 text-center" aria-label="séries" />
        <span className="text-muted-foreground text-xs">×</span>
        <Input value={reps} onChange={(e) => setReps(e.target.value)} className="h-10 w-14 rounded-lg px-1 text-center" aria-label="reps" />
        <Input value={rest} onChange={(e) => setRest(e.target.value)} className="h-10 w-12 rounded-lg px-1 text-center" aria-label="descanso" />
        <Button size="icon" className="size-10 rounded-lg" onClick={addExercise} disabled={busy} aria-label="Adicionar">
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function TemplateDaysEditor({
  templateId,
  days,
  catalog,
}: {
  templateId: string;
  days: DayData[];
  catalog: CatalogItem[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function addDay() {
    setBusy(true);
    const res = await addDayAction(templateId);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Dias e exercícios</h2>
        <span className="text-muted-foreground text-xs">
          colunas: séries × reps · descanso(s)
        </span>
      </div>
      {days.map((day) => (
        <DayCard key={day.id} templateId={templateId} day={day} catalog={catalog} />
      ))}
      <Button variant="outline" onClick={addDay} disabled={busy} className="h-11 w-full rounded-xl">
        <Plus className="size-4" />
        Adicionar dia
      </Button>
    </div>
  );
}
