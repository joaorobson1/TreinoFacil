"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberTile, OptionCard, SelectChip } from "./option-card";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import {
  DAYS_OPTIONS,
  EXPERIENCE_OPTIONS,
  LOCATION_EQUIPMENT_PRESET,
  LOCATION_OPTIONS,
  SEX_OPTIONS,
  TIME_OPTIONS,
} from "@/lib/constants";
import type {
  ExperienceLevel,
  Sex,
  TrainingLocation,
} from "@/core/domain/enums";
import { completeOnboardingAction } from "@/actions/onboarding.actions";

type Opt = { id: number; slug: string; name: string; category?: string | null };
type GoalOpt = { id: number; name: string; description: string | null };

const TOTAL_STEPS = 8;

const STEP_META = [
  { title: "Sobre você", subtitle: "Vamos calibrar o treino pelo seu corpo." },
  { title: "Seu objetivo", subtitle: "O que você quer alcançar?" },
  { title: "Sua experiência", subtitle: "Há quanto tempo você treina?" },
  { title: "Dias por semana", subtitle: "Quantos dias você consegue treinar?" },
  { title: "Tempo por treino", subtitle: "Quanto tempo tem por sessão?" },
  { title: "Onde você treina", subtitle: "Isso define os equipamentos disponíveis." },
  { title: "Seus equipamentos", subtitle: "Ajuste o que você realmente tem." },
  { title: "Limitações físicas", subtitle: "Vamos evitar exercícios que te prejudiquem." },
];

const EQUIPMENT_CATEGORY_LABELS: Record<string, string> = {
  peso_corporal: "Peso corporal",
  livre: "Pesos livres",
  barra: "Barras",
  maquina: "Máquinas",
  cabo: "Cabos e polias",
  acessorio: "Acessórios",
};

export function OnboardingWizard({
  goals,
  equipments,
  limitations,
}: {
  goals: GoalOpt[];
  equipments: Opt[];
  limitations: Opt[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const bodyweightId = useMemo(
    () => equipments.find((e) => e.slug === "peso_corporal")?.id,
    [equipments],
  );
  const noneId = useMemo(
    () => limitations.find((l) => l.slug === "nenhuma")?.id,
    [limitations],
  );

  const equipmentsByCategory = useMemo(() => {
    const map = new Map<string, Opt[]>();
    for (const e of equipments) {
      const key = e.category ?? "acessorio";
      map.set(key, [...(map.get(key) ?? []), e]);
    }
    return [...map.entries()];
  }, [equipments]);

  // Estado do formulário
  const [sex, setSex] = useState<Sex>();
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goalId, setGoalId] = useState<number>();
  const [experience, setExperience] = useState<ExperienceLevel>();
  const [days, setDays] = useState<number>();
  const [minutes, setMinutes] = useState<number>();
  const [location, setLocation] = useState<TrainingLocation>();
  const [equipmentIds, setEquipmentIds] = useState<number[]>([]);
  const [limitationIds, setLimitationIds] = useState<number[]>([]);

  function selectLocation(loc: TrainingLocation) {
    setLocation(loc);
    // pré-seleciona equipamentos do preset do ambiente
    const preset = LOCATION_EQUIPMENT_PRESET[loc];
    setEquipmentIds(
      equipments.filter((e) => preset.includes(e.slug)).map((e) => e.id),
    );
  }

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

  const canProceed = (() => {
    switch (step) {
      case 0:
        return (
          !!sex &&
          num(age) >= 10 && num(age) <= 100 &&
          num(height) >= 100 && num(height) <= 250 &&
          num(weight) >= 30 && num(weight) <= 300
        );
      case 1: return goalId != null;
      case 2: return !!experience;
      case 3: return days != null;
      case 4: return minutes != null;
      case 5: return !!location;
      default: return true;
    }
  })();

  function goNext() {
    if (!canProceed) return;
    if (step < TOTAL_STEPS - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      void submit();
    }
  }

  function goBack() {
    if (step === 0) {
      router.back();
      return;
    }
    setDirection(-1);
    setStep((s) => s - 1);
  }

  async function submit() {
    setSubmitting(true);
    const equipment_ids = [...new Set(
      bodyweightId ? [...equipmentIds, bodyweightId] : equipmentIds,
    )];
    const limitation_ids = limitationIds.filter((id) => id !== noneId);

    const result = await completeOnboardingAction({
      sex: sex!,
      age: num(age),
      height_cm: num(height),
      weight_kg: num(weight),
      goal_id: goalId!,
      experience: experience!,
      available_days: days!,
      available_time_minutes: minutes!,
      training_location: location!,
      equipment_ids,
      limitation_ids,
    });

    if (!result.ok) {
      setSubmitting(false);
      toast.error(result.error);
      return;
    }
    router.push(ROUTES.dashboard);
    router.refresh();
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-6 pb-8">
      {/* Progresso */}
      <div className="mb-8">
        <div className="text-muted-foreground mb-3 flex items-center justify-between text-xs font-medium">
          <span>
            Etapa {step + 1} de {TOTAL_STEPS}
          </span>
          <span>{Math.round(((step + 1) / TOTAL_STEPS) * 100)}%</span>
        </div>
        <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
          <motion.div
            className="bg-primary h-full rounded-full"
            animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            transition={{ type: "spring", stiffness: 160, damping: 22 }}
          />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <div className="mb-6 space-y-1.5">
              <h1 className="text-3xl font-bold tracking-tight text-balance">
                {STEP_META[step].title}
              </h1>
              <p className="text-muted-foreground">{STEP_META[step].subtitle}</p>
            </div>

            {step === 0 && (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-2">
                  {SEX_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setSex(o.value)}
                      className={cn(
                        "rounded-2xl border py-3 text-sm font-medium transition-all",
                        sex === o.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-foreground/20",
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="age">Idade</Label>
                    <Input id="age" type="number" inputMode="numeric" value={age}
                      onChange={(e) => setAge(e.target.value)} className="h-12 rounded-xl" placeholder="25" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input id="height" type="number" inputMode="decimal" value={height}
                      onChange={(e) => setHeight(e.target.value)} className="h-12 rounded-xl" placeholder="175" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input id="weight" type="number" inputMode="decimal" value={weight}
                      onChange={(e) => setWeight(e.target.value)} className="h-12 rounded-xl" placeholder="72" />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                {goals.map((g) => (
                  <OptionCard key={g.id} selected={goalId === g.id}
                    onClick={() => setGoalId(g.id)} title={g.name} subtitle={g.description} />
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                {EXPERIENCE_OPTIONS.map((o) => (
                  <OptionCard key={o.value} selected={experience === o.value}
                    onClick={() => setExperience(o.value)} title={o.label} subtitle={o.hint} />
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-3 gap-3">
                {DAYS_OPTIONS.map((d) => (
                  <NumberTile key={d} selected={days === d} onClick={() => setDays(d)}
                    value={d} unit="dias" />
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="grid grid-cols-2 gap-3">
                {TIME_OPTIONS.map((t) => (
                  <NumberTile key={t} selected={minutes === t} onClick={() => setMinutes(t)}
                    value={t} unit="minutos" />
                ))}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-3">
                {LOCATION_OPTIONS.map((o) => (
                  <OptionCard key={o.value} selected={location === o.value}
                    onClick={() => selectLocation(o.value)} title={o.label} subtitle={o.hint} />
                ))}
              </div>
            )}

            {step === 6 && (
              <div className="space-y-5">
                {equipmentsByCategory.map(([cat, items]) => (
                  <div key={cat} className="space-y-2.5">
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
              </div>
            )}

            {step === 7 && (
              <div className="flex flex-wrap gap-2">
                {limitations.map((l) => (
                  <SelectChip key={l.id} selected={limitationIds.includes(l.id)}
                    onClick={() => toggleLimitation(l.id)}>
                    {l.name}
                  </SelectChip>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navegação */}
      <div className="mt-8 flex items-center gap-3">
        <Button variant="ghost" size="icon-lg" onClick={goBack}
          className="rounded-xl" aria-label="Voltar">
          <ArrowLeft className="size-5" />
        </Button>
        <Button onClick={goNext} disabled={!canProceed || submitting}
          className="h-12 flex-1 rounded-xl text-base font-semibold">
          {submitting ? (
            <Loader2 className="size-5 animate-spin" />
          ) : step === TOTAL_STEPS - 1 ? (
            "Concluir"
          ) : (
            <>
              Continuar
              <ArrowRight className="size-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
