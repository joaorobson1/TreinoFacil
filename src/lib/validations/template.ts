import { z } from "zod";

export const templateMetaSchema = z.object({
  name: z.string().trim().min(3, "Nome muito curto"),
  goalId: z.coerce.number().int().positive("Selecione o objetivo"),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  daysPerWeek: z.coerce.number().int().min(2).max(6),
  sessionDuration: z.coerce
    .number()
    .refine((v) => [30, 45, 60, 90].includes(v), "Tempo inválido"),
  minLocation: z.enum(["home", "condo", "small_gym", "full_gym"]),
  splitType: z.string().trim().max(40).optional().default(""),
  priority: z.coerce.number().int().min(0).max(999).default(0),
  isActive: z.boolean().default(true),
});
export type TemplateMetaInput = z.infer<typeof templateMetaSchema>;

export const dayExerciseSchema = z.object({
  exerciseId: z.string().uuid(),
  sets: z.coerce.number().int().min(1).max(12),
  reps: z.string().trim().min(1).max(20),
  rest: z.coerce.number().int().min(0).max(600),
});
export type DayExerciseInput = z.infer<typeof dayExerciseSchema>;
