"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ADVANCE_CRITERIA, type PhaseInput } from "@/lib/validations/program";
import type { AdvanceCriteria } from "@/core/domain/enums";
import {
  addPhaseAction,
  deletePhaseAction,
  updatePhaseAction,
} from "@/actions/admin/program.actions";

export type PhaseRow = {
  id: string;
  phaseIndex: number;
  name: string;
  templateId: string;
  templateName: string;
  criteria: AdvanceCriteria;
  threshold: number;
  durationWeeks: number | null;
};

type Template = { id: string; name: string };

const selectCls =
  "border-input bg-background h-10 w-full rounded-lg border px-2 text-sm outline-none focus-visible:border-ring";

/** Formulário de fase compartilhado entre "adicionar" e "editar". */
function PhaseForm({
  templates,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  templates: Template[];
  initial?: PhaseRow;
  submitLabel: string;
  onSubmit: (input: PhaseInput) => Promise<boolean>;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [templateId, setTemplateId] = useState(initial?.templateId ?? "");
  const [criteria, setCriteria] = useState<AdvanceCriteria>(
    initial?.criteria ?? "workouts_completed",
  );
  const [threshold, setThreshold] = useState(String(initial?.threshold ?? 12));
  const [duration, setDuration] = useState(
    initial?.durationWeeks != null ? String(initial.durationWeeks) : "",
  );
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (name.trim().length < 1) return toast.error("Informe o nome da fase.");
    if (!templateId) return toast.error("Selecione a ficha.");
    setBusy(true);
    const ok = await onSubmit({
      name,
      templateId,
      advanceCriteria: criteria,
      advanceThreshold: Number(threshold),
      durationWeeks: duration.trim() === "" ? null : Number(duration),
    });
    setBusy(false);
    if (ok && !initial) {
      setName("");
      setTemplateId("");
      setDuration("");
    }
  }

  return (
    <div className="space-y-2">
      <Input value={name} onChange={(e) => setName(e.target.value)}
        placeholder="Nome da fase (ex.: Fase 1 — Adaptação)" className="h-10 rounded-lg" />
      <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className={selectCls}>
        <option value="">Escolha a ficha desta fase...</option>
        {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <div className="flex items-center gap-2">
        <select value={criteria} onChange={(e) => setCriteria(e.target.value as AdvanceCriteria)} className={`${selectCls} flex-1`}>
          {ADVANCE_CRITERIA.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <Input value={threshold} onChange={(e) => setThreshold(e.target.value)}
          className="h-10 w-20 rounded-lg text-center" aria-label="meta de avanço" />
      </div>
      <p className="text-muted-foreground text-xs">
        {ADVANCE_CRITERIA.find((c) => c.value === criteria)?.hint}
      </p>
      <div className="flex items-center gap-2">
        <Label className="text-muted-foreground shrink-0 text-xs">Duração estimada</Label>
        <Input value={duration} onChange={(e) => setDuration(e.target.value)}
          placeholder="opcional" className="h-9 w-24 rounded-lg text-center" aria-label="duração em semanas" />
        <span className="text-muted-foreground text-xs">semanas</span>
      </div>
      <div className="flex gap-2 pt-1">
        <Button className="h-10 flex-1 rounded-lg" onClick={submit} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <>{initial ? <Check className="size-4" /> : <Plus className="size-4" />}{submitLabel}</>}
        </Button>
        {onCancel && (
          <Button variant="outline" className="h-10 rounded-lg" onClick={onCancel} disabled={busy}>
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function PhaseCard({
  programId,
  phase,
  templates,
}: {
  programId: string;
  phase: PhaseRow;
  templates: Template[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  const criteriaLabel = (c: string) => ADVANCE_CRITERIA.find((x) => x.value === c)?.label ?? c;

  async function update(input: PhaseInput): Promise<boolean> {
    const res = await updatePhaseAction(phase.id, programId, input);
    if (!res.ok) {
      toast.error(res.error);
      return false;
    }
    toast.success("Fase salva.");
    setEditing(false);
    router.refresh();
    return true;
  }
  async function remove() {
    const res = await deletePhaseAction(phase.id, programId);
    if (!res.ok) return toast.error(res.error);
    router.refresh();
  }

  return (
    <div className="bg-card rounded-2xl border p-3.5">
      {editing ? (
        <PhaseForm
          templates={templates}
          initial={phase}
          submitLabel="Salvar"
          onSubmit={update}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold">
            {phase.phaseIndex}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{phase.name}</p>
            <p className="text-muted-foreground truncate text-xs">
              {phase.templateName} · avança em {phase.threshold} ({criteriaLabel(phase.criteria)})
              {phase.durationWeeks != null && ` · ~${phase.durationWeeks} sem`}
            </p>
          </div>
          <Button size="icon" variant="ghost" className="size-8 rounded-lg"
            onClick={() => setEditing(true)} aria-label="Editar fase">
            <Pencil className="size-4" />
          </Button>
          <ConfirmDialog
            title="Excluir fase?"
            description={<>A fase <strong>{phase.name}</strong> será removida do programa.</>}
            confirmLabel="Excluir"
            onConfirm={remove}
            trigger={
              <Button size="icon" variant="ghost" className="text-destructive size-8 rounded-lg" aria-label="Remover">
                <Trash2 className="size-4" />
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}

export function ProgramPhasesEditor({
  programId,
  phases,
  templates,
}: {
  programId: string;
  phases: PhaseRow[];
  templates: Template[];
}) {
  const router = useRouter();

  async function add(input: PhaseInput): Promise<boolean> {
    const res = await addPhaseAction(programId, input);
    if (!res.ok) {
      toast.error(res.error);
      return false;
    }
    toast.success("Fase adicionada.");
    router.refresh();
    return true;
  }

  return (
    <div className="space-y-3">
      <h2 className="font-semibold">Fases do programa</h2>

      <div className="space-y-2">
        {phases.map((p) => (
          <PhaseCard key={p.id} programId={programId} phase={p} templates={templates} />
        ))}
        {phases.length === 0 && (
          <p className="text-muted-foreground text-sm">Nenhuma fase ainda. Adicione a primeira abaixo.</p>
        )}
      </div>

      <div className="bg-card space-y-2 rounded-2xl border p-3">
        <p className="text-sm font-semibold">Nova fase</p>
        <PhaseForm templates={templates} submitLabel="Adicionar" onSubmit={add} />
      </div>
    </div>
  );
}
