import { z } from "zod";

export const onboardingSchema = z.object({
  sex: z.enum(["male", "female", "other"]),
  age: z.coerce.number().int().min(10, "Idade inválida").max(100, "Idade inválida"),
  height_cm: z.coerce.number().min(100, "Altura inválida").max(250, "Altura inválida"),
  weight_kg: z.coerce.number().min(30, "Peso inválido").max(300, "Peso inválido"),
  goal_id: z.coerce.number().int().positive("Selecione um objetivo"),
  experience: z.enum(["never", "up_to_6m", "6m_to_2y", "over_2y"]),
  available_days: z.coerce.number().int().min(2).max(6),
  available_time_minutes: z.coerce
    .number()
    .refine((v) => [30, 45, 60, 90].includes(v), "Tempo inválido"),
  training_location: z.enum(["home", "condo", "small_gym", "full_gym"]),
  equipment_ids: z.array(z.number().int()).default([]),
  limitation_ids: z.array(z.number().int()).default([]),
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;
