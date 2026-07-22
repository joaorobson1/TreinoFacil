"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectChip } from "@/components/onboarding/option-card";
import { cn } from "@/lib/utils";
import type { ExerciseLevel, MediaType } from "@/core/domain/enums";
import type { ExerciseInput } from "@/lib/validations/exercise";
import {
  createExerciseAction,
  deleteExerciseAction,
  updateExerciseAction,
} from "@/actions/admin/exercise.actions";

type Lookup = { id: number; name: string };

export type ExerciseInitial = ExerciseInput & { id: string };

const LEVELS: { value: ExerciseLevel; label: string }[] = [
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
];
const MEDIA_TYPES: MediaType[] = ["image", "gif", "video"];

const selectCls =
  "border-input bg-background h-11 w-full rounded-xl border px-3 text-sm outline-none focus-visible:border-ring";
const areaCls =
  "border-input bg-background min-h-20 w-full rounded-xl border p-3 text-sm outline-none focus-visible:border-ring";

export function ExerciseForm({
  categories,
  muscles,
  equipments,
  initial,
}: {
  categories: Lookup[];
  muscles: Lookup[];
  equipments: Lookup[];
  initial?: ExerciseInitial;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [f, setF] = useState<ExerciseInput>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    categoryId: initial?.categoryId ?? null,
    primaryMuscleId: initial?.primaryMuscleId ?? 0,
    level: initial?.level ?? "beginner",
    equipmentIds: initial?.equipmentIds ?? [],
    secondaryMuscleIds: initial?.secondaryMuscleIds ?? [],
    execution: initial?.execution ?? "",
    breathing: initial?.breathing ?? "",
    commonMistakes: initial?.commonMistakes ?? "",
    tips: initial?.tips ?? "",
    media: initial?.media ?? [],
    isActive: initial?.isActive ?? true,
  });
  const set = <K extends keyof ExerciseInput>(k: K, v: ExerciseInput[K]) =>
    setF((prev) => ({ ...prev, [k]: v }));
  const toggle = (k: "equipmentIds" | "secondaryMuscleIds", id: number) =>
    setF((prev) => ({
      ...prev,
      [k]: prev[k].includes(id) ? prev[k].filter((x) => x !== id) : [...prev[k], id],
    }));

  async function submit() {
    if (f.name.trim().length < 2) return toast.error("Informe o nome.");
    if (!f.primaryMuscleId) return toast.error("Selecione o músculo principal.");
    if (f.equipmentIds.length === 0) return toast.error("Selecione ao menos um equipamento.");
    setSaving(true);
    const payload = { ...f, media: f.media.filter((m) => m.url.trim() !== "") };
    const result = initial
      ? await updateExerciseAction(initial.id, payload)
      : await createExerciseAction(payload);
    if (!result.ok) {
      setSaving(false);
      return toast.error(result.error);
    }
    toast.success(initial ? "Exercício atualizado." : "Exercício criado.");
    router.push("/admin/exercises");
    router.refresh();
  }

  async function remove() {
    if (!initial) return;
    setDeleting(true);
    const result = await deleteExerciseAction(initial.id);
    if (!result.ok) {
      setDeleting(false);
      return toast.error(result.error);
    }
    toast.success("Exercício excluído.");
    router.push("/admin/exercises");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" value={f.name} onChange={(e) => set("name", e.target.value)}
          className="h-11 rounded-xl" placeholder="Ex.: Supino reto com halteres" />
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <textarea value={f.description} onChange={(e) => set("description", e.target.value)}
          className={areaCls} placeholder="Resumo do exercício" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Categoria</Label>
          <select value={f.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value ? Number(e.target.value) : null)} className={selectCls}>
            <option value="">—</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Músculo principal</Label>
          <select value={f.primaryMuscleId || ""} onChange={(e) => set("primaryMuscleId", Number(e.target.value))} className={selectCls}>
            <option value="">—</option>
            {muscles.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Nível</Label>
        <div className="grid grid-cols-3 gap-2">
          {LEVELS.map((l) => (
            <button key={l.value} type="button" onClick={() => set("level", l.value)}
              className={cn("rounded-xl border py-2.5 text-sm font-medium transition-colors",
                f.level === l.value ? "border-primary bg-primary/10" : "border-border")}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Equipamentos exigidos</Label>
        <div className="flex flex-wrap gap-2">
          {equipments.map((eq) => (
            <SelectChip key={eq.id} selected={f.equipmentIds.includes(eq.id)} onClick={() => toggle("equipmentIds", eq.id)}>
              {eq.name}
            </SelectChip>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Músculos secundários</Label>
        <div className="flex flex-wrap gap-2">
          {muscles.filter((m) => m.id !== f.primaryMuscleId).map((m) => (
            <SelectChip key={m.id} selected={f.secondaryMuscleIds.includes(m.id)} onClick={() => toggle("secondaryMuscleIds", m.id)}>
              {m.name}
            </SelectChip>
          ))}
        </div>
      </div>

      {(["execution", "breathing", "commonMistakes", "tips"] as const).map((k) => {
        const labels = { execution: "Como executar", breathing: "Respiração", commonMistakes: "Erros comuns", tips: "Dicas" };
        return (
          <div key={k} className="space-y-2">
            <Label>{labels[k]}</Label>
            <textarea value={f[k]} onChange={(e) => set(k, e.target.value)} className={areaCls} />
          </div>
        );
      })}

      <div className="space-y-2">
        <Label>Mídia (imagem / GIF / vídeo por URL)</Label>
        <div className="space-y-2">
          {f.media.map((m, i) => (
            <div key={i} className="flex gap-2">
              <select value={m.type} onChange={(e) => set("media", f.media.map((x, j) => j === i ? { ...x, type: e.target.value as MediaType } : x))}
                className={cn(selectCls, "w-24 shrink-0")}>
                {MEDIA_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <Input value={m.url} onChange={(e) => set("media", f.media.map((x, j) => j === i ? { ...x, url: e.target.value } : x))}
                className="h-11 rounded-xl" placeholder="https://..." />
              <Button type="button" variant="ghost" size="icon" className="rounded-xl" onClick={() => set("media", f.media.filter((_, j) => j !== i))}>
                <X className="size-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={() => set("media", [...f.media, { type: "image", url: "" }])}>
            <Plus className="size-4" />
            Adicionar mídia
          </Button>
        </div>
      </div>

      <label className="bg-card flex items-center justify-between rounded-xl border p-4">
        <span className="text-sm font-medium">Ativo</span>
        <input type="checkbox" checked={f.isActive} onChange={(e) => set("isActive", e.target.checked)}
          className="accent-primary size-5" />
      </label>

      <div className="flex gap-2 pt-2">
        <Button onClick={submit} disabled={saving} className="h-12 flex-1 rounded-2xl text-base font-semibold">
          {saving ? <Loader2 className="size-5 animate-spin" /> : initial ? "Salvar" : "Criar exercício"}
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
