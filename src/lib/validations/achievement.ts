import { z } from "zod";
import type { AchievementCriteria } from "@/core/domain/enums";

export const ACHIEVEMENT_CRITERIA: { value: AchievementCriteria; label: string; hint: string }[] = [
  { value: "first_workout", label: "Primeiro treino", hint: "meta = 1" },
  { value: "total_workouts", label: "Total de treinos", hint: "meta = nº de treinos" },
  { value: "consecutive_days", label: "Dias consecutivos", hint: "meta = dias de sequência" },
  { value: "total_volume_kg", label: "Volume total (kg)", hint: "meta = kg movimentados" },
  { value: "total_sets", label: "Total de séries", hint: "meta = nº de séries" },
  { value: "load_progress", label: "Evolução de carga", hint: "meta = 1" },
  { value: "perfect_month", label: "Mês perfeito", hint: "meta = 1" },
  { value: "body_weight_change", label: "Mudança de peso corporal", hint: "meta = kg" },
];

export const achievementSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome"),
  description: z.string().trim().max(200).optional().default(""),
  icon: z.string().trim().max(40).optional().default(""),
  criteria: z.enum([
    "first_workout",
    "consecutive_days",
    "total_workouts",
    "total_volume_kg",
    "load_progress",
    "perfect_month",
    "total_sets",
    "body_weight_change",
  ]),
  threshold: z.coerce.number().min(0).max(10_000_000),
  tier: z.coerce.number().int().min(1).max(5).default(1),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isActive: z.boolean().default(true),
});
export type AchievementInput = z.infer<typeof achievementSchema>;
