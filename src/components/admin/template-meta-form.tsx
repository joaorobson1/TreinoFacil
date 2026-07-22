"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {
  ExerciseLevel,
  TrainingLocation,
} from "@/core/domain/enums";
import type { TemplateMetaInput } from "@/lib/validations/template";
import {
  createTemplateAction,
  deleteTemplateAction,
  updateTemplateMetaAction,
} from "@/actions/admin/template.actions";

type Goal = { id: number; name: string };
export type TemplateMetaInitial = TemplateMetaInput & { id: string };

const LEVELS: { value: ExerciseLevel; label: string }[] = [
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
];
const LOCATIONS: { value: TrainingLocation; label: string }[] = [
  { value: "home", label: "Casa" },
  { value: "condo", label: "Condomínio" },
  { value: "small_gym", label: "Academia pequena" },
  { value: "full_gym", label: "Academia completa" },
];
const selectCls =
  "border-input bg-background h-11 w-full rounded-xl border px-3 text-sm outline-none focus-visible:border-ring";

export function TemplateMetaForm({
  goals,
  initial,
}: {
  goals: Goal[];
  initial?: TemplateMetaInitial;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [f, setF] = useState<TemplateMetaInput>({
    name: initial?.name ?? "",
    goalId: initial?.goalId ?? 0,
    experience: initial?.experience ?? "beginner",
    daysPerWeek: initial?.daysPerWeek ?? 3,
    sessionDuration: initial?.sessionDuration ?? 60,
    minLocation: initial?.minLocation ?? "full_gym",
    splitType: initial?.splitType ?? "",
    priority: initial?.priority ?? 0,
    isActive: initial?.isActive ?? true,
  });
  const set = <K extends keyof TemplateMetaInput>(k: K, v: TemplateMetaInput[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  async function submit() {
    if (f.name.trim().length < 3) return toast.error("Informe o nome da ficha.");
    if (!f.goalId) return toast.error("Selecione o objetivo.");
    setSaving(true);

    if (initial) {
      const res = await updateTemplateMetaAction(initial.id, f);
      setSaving(false);
      if (!res.ok) return toast.error(res.error);
      toast.success("Ficha salva.");
      router.refresh();
      return;
    }

    const res = await createTemplateAction(f);
    if (!res.ok) {
      setSaving(false);
      return toast.error(res.error);
    }
    toast.success("Ficha criada. Agora monte os dias.");
    router.push(`/admin/templates/${res.value.id}`);
  }

  async function remove() {
    if (!initial) return;
    setDeleting(true);
    const res = await deleteTemplateAction(initial.id);
    if (!res.ok) {
      setDeleting(false);
      return toast.error(res.error);
    }
    toast.success("Ficha excluída.");
    router.push("/admin/templates");
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tname">Nome da ficha</Label>
        <Input id="tname" value={f.name} onChange={(e) => set("name", e.target.value)}
          className="h-11 rounded-xl" placeholder="Ex.: Hipertrofia • Iniciante • 4 dias" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Objetivo</Label>
          <select value={f.goalId || ""} onChange={(e) => set("goalId", Number(e.target.value))} className={selectCls}>
            <option value="">—</option>
            {goals.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Ambiente mínimo</Label>
          <select value={f.minLocation} onChange={(e) => set("minLocation", e.target.value as TrainingLocation)} className={selectCls}>
            {LOCATIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Experiência</Label>
        <div className="grid grid-cols-3 gap-2">
          {LEVELS.map((l) => (
            <button key={l.value} type="button" onClick={() => set("experience", l.value)}
              className={cn("rounded-xl border py-2.5 text-sm font-medium transition-colors",
                f.experience === l.value ? "border-primary bg-primary/10" : "border-border")}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Dias por semana</Label>
          <select value={f.daysPerWeek} onChange={(e) => set("daysPerWeek", Number(e.target.value))} className={selectCls}>
            {[2, 3, 4, 5, 6].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Tempo por sessão</Label>
          <select value={f.sessionDuration} onChange={(e) => set("sessionDuration", Number(e.target.value))} className={selectCls}>
            {[30, 45, 60, 90].map((t) => <option key={t} value={t}>{t} min</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Split (opcional)</Label>
          <Input value={f.splitType} onChange={(e) => set("splitType", e.target.value)}
            className="h-11 rounded-xl" placeholder="full_body, ppl, abcd..." />
        </div>
        <div className="space-y-2">
          <Label>Prioridade</Label>
          <Input type="number" value={f.priority} onChange={(e) => set("priority", Number(e.target.value))}
            className="h-11 rounded-xl" />
        </div>
      </div>

      <label className="bg-card flex items-center justify-between rounded-xl border p-4">
        <span className="text-sm font-medium">Ativa</span>
        <input type="checkbox" checked={f.isActive} onChange={(e) => set("isActive", e.target.checked)}
          className="accent-primary size-5" />
      </label>

      <div className="flex gap-2 pt-1">
        <Button onClick={submit} disabled={saving} className="h-12 flex-1 rounded-2xl text-base font-semibold">
          {saving ? <Loader2 className="size-5 animate-spin" /> : initial ? "Salvar ficha" : "Criar ficha"}
        </Button>
        {initial && (
          <Button variant="destructive" onClick={remove} disabled={deleting} className="h-12 rounded-2xl">
            {deleting ? <Loader2 className="size-5 animate-spin" /> : <Trash2 className="size-5" />}
          </Button>
        )}
      </div>
    </div>
  );
}
