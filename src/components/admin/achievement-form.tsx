"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type AchievementInput,
  ACHIEVEMENT_CRITERIA,
} from "@/lib/validations/achievement";
import {
  createAchievementAction,
  deleteAchievementAction,
  updateAchievementAction,
} from "@/actions/admin/achievement.actions";

export type AchievementInitial = AchievementInput & { id: number };

const selectCls =
  "border-input bg-background h-11 w-full rounded-xl border px-3 text-sm outline-none focus-visible:border-ring";
const areaCls =
  "border-input bg-background min-h-16 w-full rounded-xl border p-3 text-sm outline-none focus-visible:border-ring";

export function AchievementForm({ initial }: { initial?: AchievementInitial }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [f, setF] = useState<AchievementInput>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    icon: initial?.icon ?? "",
    criteria: initial?.criteria ?? "total_workouts",
    threshold: initial?.threshold ?? 1,
    tier: initial?.tier ?? 1,
    sortOrder: initial?.sortOrder ?? 0,
    isActive: initial?.isActive ?? true,
  });
  const set = <K extends keyof AchievementInput>(k: K, v: AchievementInput[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  const hint = ACHIEVEMENT_CRITERIA.find((c) => c.value === f.criteria)?.hint;

  async function submit() {
    if (f.name.trim().length < 2) return toast.error("Informe o nome.");
    setSaving(true);
    if (initial) {
      const res = await updateAchievementAction(initial.id, f);
      setSaving(false);
      if (!res.ok) return toast.error(res.error);
      toast.success("Conquista salva.");
      router.push("/admin/achievements");
      router.refresh();
      return;
    }
    const res = await createAchievementAction(f);
    if (!res.ok) {
      setSaving(false);
      return toast.error(res.error);
    }
    toast.success("Conquista criada.");
    router.push("/admin/achievements");
    router.refresh();
  }

  async function remove() {
    if (!initial) return;
    setDeleting(true);
    const res = await deleteAchievementAction(initial.id);
    if (!res.ok) {
      setDeleting(false);
      return toast.error(res.error);
    }
    toast.success("Conquista excluída.");
    router.push("/admin/achievements");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="aname">Nome</Label>
        <Input id="aname" value={f.name} onChange={(e) => set("name", e.target.value)}
          className="h-11 rounded-xl" placeholder="Ex.: 7 dias seguidos" />
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <textarea value={f.description} onChange={(e) => set("description", e.target.value)}
          className={areaCls} placeholder="Treinou 7 dias consecutivos" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Critério</Label>
          <select value={f.criteria} onChange={(e) => set("criteria", e.target.value as AchievementInput["criteria"])} className={selectCls}>
            {ACHIEVEMENT_CRITERIA.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Meta (threshold)</Label>
          <Input type="number" value={f.threshold} onChange={(e) => set("threshold", Number(e.target.value))}
            className="h-11 rounded-xl" />
          {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>Ícone (lucide)</Label>
          <Input value={f.icon} onChange={(e) => set("icon", e.target.value)} className="h-11 rounded-xl" placeholder="flame" />
        </div>
        <div className="space-y-2">
          <Label>Nível</Label>
          <Input type="number" value={f.tier} onChange={(e) => set("tier", Number(e.target.value))} className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Ordem</Label>
          <Input type="number" value={f.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} className="h-11 rounded-xl" />
        </div>
      </div>

      <label className="bg-card flex items-center justify-between rounded-xl border p-4">
        <span className="text-sm font-medium">Ativa</span>
        <input type="checkbox" checked={f.isActive} onChange={(e) => set("isActive", e.target.checked)}
          className="accent-primary size-5" />
      </label>

      <div className="flex gap-2 pt-1">
        <Button onClick={submit} disabled={saving} className="h-12 flex-1 rounded-2xl text-base font-semibold">
          {saving ? <Loader2 className="size-5 animate-spin" /> : initial ? "Salvar" : "Criar conquista"}
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
