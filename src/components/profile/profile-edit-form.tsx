"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionCard, NumberTile, SelectChip } from "@/components/onboarding/option-card";
import {
  DAYS_OPTIONS,
  EXPERIENCE_OPTIONS,
  LOCATION_OPTIONS,
  SEX_OPTIONS,
  TIME_OPTIONS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type {
  ExperienceLevel,
  Sex,
  TrainingLocation,
} from "@/core/domain/enums";
import { ROUTES } from "@/lib/routes";
import { updateProfileAction } from "@/actions/profile.actions";

type Opt = { id: number; slug: string; name: string; category?: string | null };
type GoalOpt = { id: number; name: string; description: string | null };

const EQUIPMENT_CATEGORY_LABELS: Record<string, string> = {
  peso_corporal: "Peso corporal",
  livre: "Pesos livres",
  barra: "Barras",
  maquina: "Máquinas",
  cabo: "Cabos e polias",
  acessorio: "Acessórios",
};

export type ProfileInitial = {
  name: string;
  sex: Sex | null;
  age: number | null;
  height_cm: number | null;
  goal_id: number | null;
  experience: ExperienceLevel | null;
  available_days: number | null;
  available_time_minutes: number | null;
  training_location: TrainingLocation | null;
  equipment_ids: number[];
  limitation_ids: number[];
};

export function ProfileEditForm({
  goals,
  equipments,
  limitations,
  initial,
}: {
  goals: GoalOpt[];
  equipments: Opt[];
  limitations: Opt[];
  initial: ProfileInitial;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(initial.name);
  const [sex, setSex] = useState<Sex | null>(initial.sex);
  const [age, setAge] = useState(initial.age != null ? String(initial.age) : "");
  const [height, setHeight] = useState(initial.height_cm != null ? String(initial.height_cm) : "");
  const [goalId, setGoalId] = useState<number | null>(initial.goal_id);
  const [experience, setExperience] = useState<ExperienceLevel | null>(initial.experience);
  const [days, setDays] = useState<number | null>(initial.available_days);
  const [minutes, setMinutes] = useState<number | null>(initial.available_time_minutes);
  const [location, setLocation] = useState<TrainingLocation | null>(initial.training_location);
  const [equipmentIds, setEquipmentIds] = useState<number[]>(initial.equipment_ids);
  const [limitationIds, setLimitationIds] = useState<number[]>(initial.limitation_ids);

  const noneId = useMemo(
    () => limitations.find((l) => l.slug === "nenhuma")?.id,
    [limitations],
  );
  const equipmentByCat = useMemo(() => {
    const map = new Map<string, Opt[]>();
    for (const e of equipments) {
      const cat = e.category ?? "acessorio";
      map.set(cat, [...(map.get(cat) ?? []), e]);
    }
    return [...map.entries()];
  }, [equipments]);

  function toggleEquipment(id: number) {
    setEquipmentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }
  function toggleLimitation(id: number) {
    setLimitationIds((prev) => {
      if (id === noneId) return prev.includes(id) ? [] : [id];
      const next = prev.filter((x) => x !== noneId);
      return next.includes(id) ? next.filter((x) => x !== id) : [...next, id];
    });
  }

  const num = (s: string) => Number(s.replace(",", "."));

  async function save() {
    if (name.trim().length < 2) return toast.error("Informe seu nome.");
    if (!sex || !goalId || !experience || !days || !minutes || !location) {
      return toast.error("Preencha todos os campos.");
    }
    if (num(age) < 16 || num(age) > 100) return toast.error("Idade inválida (mínimo 16).");
    if (num(height) < 100 || num(height) > 250) return toast.error("Altura inválida.");

    setSaving(true);
    const res = await updateProfileAction({
      name,
      sex,
      age: num(age),
      height_cm: num(height),
      goal_id: goalId,
      experience,
      available_days: days,
      available_time_minutes: minutes,
      training_location: location,
      equipment_ids: equipmentIds.filter((id) => id !== noneId),
      limitation_ids: limitationIds.filter((id) => id !== noneId),
    });
    setSaving(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Perfil atualizado! As mudanças de treino valem no próximo “Gerar novamente”.");
    router.push(ROUTES.profile);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="p-name">Nome</Label>
          <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="p-age">Idade</Label>
            <Input id="p-age" type="number" inputMode="numeric" min={16} value={age}
              onChange={(e) => setAge(e.target.value)} className="h-11 rounded-xl" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="p-height">Altura (cm)</Label>
            <Input id="p-height" type="number" inputMode="decimal" value={height}
              onChange={(e) => setHeight(e.target.value)} className="h-11 rounded-xl" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Sexo</Label>
          <div className="grid grid-cols-3 gap-2">
            {SEX_OPTIONS.map((o) => (
              <button key={o.value} type="button" onClick={() => setSex(o.value)}
                aria-pressed={sex === o.value}
                className={cn("rounded-xl border py-2.5 text-sm font-medium transition-colors",
                  sex === o.value ? "border-primary bg-primary/10" : "border-border")}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Objetivo</h2>
        {goals.map((g) => (
          <OptionCard key={g.id} selected={goalId === g.id} onClick={() => setGoalId(g.id)}
            title={g.name} subtitle={g.description} />
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Experiência</h2>
        {EXPERIENCE_OPTIONS.map((o) => (
          <OptionCard key={o.value} selected={experience === o.value}
            onClick={() => setExperience(o.value)} title={o.label} subtitle={o.hint} />
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Dias por semana</h2>
        <div className="grid grid-cols-5 gap-2">
          {DAYS_OPTIONS.map((d) => (
            <NumberTile key={d} selected={days === d} onClick={() => setDays(d)} value={d} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Tempo por treino</h2>
        <div className="grid grid-cols-4 gap-2">
          {TIME_OPTIONS.map((t) => (
            <NumberTile key={t} selected={minutes === t} onClick={() => setMinutes(t)} value={t} unit="min" />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Onde treina</h2>
        {LOCATION_OPTIONS.map((o) => (
          <OptionCard key={o.value} selected={location === o.value}
            onClick={() => setLocation(o.value)} title={o.label} subtitle={o.hint} />
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Equipamentos</h2>
        {equipmentByCat.map(([cat, items]) => (
          <div key={cat} className="space-y-2">
            <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {EQUIPMENT_CATEGORY_LABELS[cat] ?? cat}
            </div>
            <div className="flex flex-wrap gap-2">
              {items.map((e) => (
                <SelectChip key={e.id} selected={equipmentIds.includes(e.id)}
                  onClick={() => toggleEquipment(e.id)}>
                  {e.name}
                </SelectChip>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Limitações físicas</h2>
        <div className="flex flex-wrap gap-2">
          {limitations.map((l) => (
            <SelectChip key={l.id} selected={limitationIds.includes(l.id)}
              onClick={() => toggleLimitation(l.id)}>
              {l.name}
            </SelectChip>
          ))}
        </div>
      </section>

      <div className="bg-background/80 sticky bottom-0 -mx-6 border-t px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
        <Button onClick={save} disabled={saving} className="h-12 w-full rounded-2xl text-base font-semibold">
          {saving ? <Loader2 className="size-5 animate-spin" /> : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}
