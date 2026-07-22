"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ExerciseLevel } from "@/core/domain/enums";
import type { ProgramMetaInput } from "@/lib/validations/program";
import {
  createProgramAction,
  deleteProgramAction,
  updateProgramMetaAction,
} from "@/actions/admin/program.actions";

type Goal = { id: number; name: string };
export type ProgramMetaInitial = ProgramMetaInput & { id: string };

const LEVELS: { value: ExerciseLevel; label: string }[] = [
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
];
const selectCls =
  "border-input bg-background h-11 w-full rounded-xl border px-3 text-sm outline-none focus-visible:border-ring";

export function ProgramMetaForm({
  goals,
  initial,
}: {
  goals: Goal[];
  initial?: ProgramMetaInitial;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [f, setF] = useState<ProgramMetaInput>({
    name: initial?.name ?? "",
    goalId: initial?.goalId ?? 0,
    experience: initial?.experience ?? "beginner",
    isActive: initial?.isActive ?? true,
  });
  const set = <K extends keyof ProgramMetaInput>(k: K, v: ProgramMetaInput[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  async function submit() {
    if (f.name.trim().length < 3) return toast.error("Informe o nome do programa.");
    if (!f.goalId) return toast.error("Selecione o objetivo.");
    setSaving(true);
    if (initial) {
      const res = await updateProgramMetaAction(initial.id, f);
      setSaving(false);
      if (!res.ok) return toast.error(res.error);
      toast.success("Programa salvo.");
      router.refresh();
      return;
    }
    const res = await createProgramAction(f);
    if (!res.ok) {
      setSaving(false);
      return toast.error(res.error);
    }
    toast.success("Programa criado. Agora monte as fases.");
    router.push(`/admin/programs/${res.value.id}`);
  }

  async function remove() {
    if (!initial) return;
    setDeleting(true);
    const res = await deleteProgramAction(initial.id);
    if (!res.ok) {
      setDeleting(false);
      return toast.error(res.error);
    }
    toast.success("Programa excluído.");
    router.push("/admin/programs");
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pname">Nome do programa</Label>
        <Input id="pname" value={f.name} onChange={(e) => set("name", e.target.value)}
          className="h-11 rounded-xl" placeholder="Ex.: Hipertrofia Iniciante — 12 semanas" />
      </div>

      <div className="space-y-2">
        <Label>Objetivo</Label>
        <select value={f.goalId || ""} onChange={(e) => set("goalId", Number(e.target.value))} className={selectCls}>
          <option value="">—</option>
          {goals.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
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

      <label className="bg-card flex items-center justify-between rounded-xl border p-4">
        <span className="text-sm font-medium">Ativo</span>
        <input type="checkbox" checked={f.isActive} onChange={(e) => set("isActive", e.target.checked)}
          className="accent-primary size-5" />
      </label>

      <div className="flex gap-2 pt-1">
        <Button onClick={submit} disabled={saving} className="h-12 flex-1 rounded-2xl text-base font-semibold">
          {saving ? <Loader2 className="size-5 animate-spin" /> : initial ? "Salvar programa" : "Criar programa"}
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
