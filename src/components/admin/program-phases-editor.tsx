"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADVANCE_CRITERIA } from "@/lib/validations/program";
import type { AdvanceCriteria } from "@/core/domain/enums";
import {
  addPhaseAction,
  deletePhaseAction,
} from "@/actions/admin/program.actions";

export type PhaseRow = {
  id: string;
  phaseIndex: number;
  name: string;
  templateName: string;
  criteria: AdvanceCriteria;
  threshold: number;
};

const selectCls =
  "border-input bg-background h-10 w-full rounded-lg border px-2 text-sm outline-none focus-visible:border-ring";

export function ProgramPhasesEditor({
  programId,
  phases,
  templates,
}: {
  programId: string;
  phases: PhaseRow[];
  templates: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [criteria, setCriteria] = useState<AdvanceCriteria>("workouts_completed");
  const [threshold, setThreshold] = useState("12");
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const criteriaLabel = (c: string) => ADVANCE_CRITERIA.find((x) => x.value === c)?.label ?? c;

  async function add() {
    if (name.trim().length < 1) return toast.error("Informe o nome da fase.");
    if (!templateId) return toast.error("Selecione a ficha.");
    setBusy(true);
    const res = await addPhaseAction(programId, {
      name,
      templateId,
      advanceCriteria: criteria,
      advanceThreshold: Number(threshold),
      durationWeeks: null,
    });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    setName("");
    setTemplateId("");
    router.refresh();
  }

  async function remove(id: string) {
    setRemoving(id);
    const res = await deletePhaseAction(id, programId);
    if (!res.ok) {
      setRemoving(null);
      return toast.error(res.error);
    }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <h2 className="font-semibold">Fases do programa</h2>

      <div className="space-y-2">
        {phases.map((p) => (
          <div key={p.id} className="bg-card flex items-center gap-3 rounded-2xl border p-3.5">
            <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold">
              {p.phaseIndex}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{p.name}</p>
              <p className="text-muted-foreground truncate text-xs">
                {p.templateName} · avança em {p.threshold} ({criteriaLabel(p.criteria)})
              </p>
            </div>
            <Button size="icon" variant="ghost" className="text-destructive size-8 rounded-lg"
              onClick={() => remove(p.id)} disabled={removing === p.id} aria-label="Remover">
              {removing === p.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            </Button>
          </div>
        ))}
        {phases.length === 0 && (
          <p className="text-muted-foreground text-sm">Nenhuma fase ainda. Adicione a primeira abaixo.</p>
        )}
      </div>

      <div className="bg-card space-y-2 rounded-2xl border p-3">
        <p className="text-sm font-semibold">Nova fase</p>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Fase 1 — Adaptação" className="h-10 rounded-lg" />
        <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className={selectCls}>
          <option value="">Escolha a ficha desta fase...</option>
          {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <select value={criteria} onChange={(e) => setCriteria(e.target.value as AdvanceCriteria)} className={`${selectCls} flex-1`}>
            {ADVANCE_CRITERIA.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <Input value={threshold} onChange={(e) => setThreshold(e.target.value)} className="h-10 w-20 rounded-lg text-center" aria-label="meta" />
          <Button className="h-10 rounded-lg" onClick={add} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">
          {ADVANCE_CRITERIA.find((c) => c.value === criteria)?.hint}
        </p>
      </div>
    </div>
  );
}
