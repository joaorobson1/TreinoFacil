import { z } from "zod";
import type { AdvanceCriteria } from "@/core/domain/enums";

export const ADVANCE_CRITERIA: { value: AdvanceCriteria; label: string; hint: string }[] = [
  { value: "workouts_completed", label: "Treinos concluídos", hint: "avança após N treinos na fase" },
  { value: "time_weeks", label: "Semanas", hint: "avança após N semanas na fase" },
  { value: "completion_pct", label: "% de conclusão", hint: "aproximado por nº de treinos" },
];

export const programMetaSchema = z.object({
  name: z.string().trim().min(3, "Nome muito curto"),
  goalId: z.coerce.number().int().positive("Selecione o objetivo"),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  isActive: z.boolean().default(true),
});
export type ProgramMetaInput = z.infer<typeof programMetaSchema>;

export const phaseSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da fase"),
  templateId: z.string().uuid("Selecione a ficha"),
  advanceCriteria: z.enum(["workouts_completed", "completion_pct", "time_weeks"]),
  advanceThreshold: z.coerce.number().min(1).max(9999),
  durationWeeks: z.coerce.number().int().min(0).max(104).nullable().default(null),
});
export type PhaseInput = z.infer<typeof phaseSchema>;
