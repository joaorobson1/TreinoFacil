import { z } from "zod";

export const exerciseSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome"),
  description: z.string().trim().max(500).optional().default(""),
  categoryId: z.coerce.number().int().positive().nullable().default(null),
  primaryMuscleId: z.coerce.number().int().positive({ message: "Selecione o músculo principal" }),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  equipmentIds: z.array(z.number().int()).min(1, "Selecione ao menos um equipamento"),
  secondaryMuscleIds: z.array(z.number().int()).default([]),
  execution: z.string().trim().optional().default(""),
  breathing: z.string().trim().optional().default(""),
  commonMistakes: z.string().trim().optional().default(""),
  tips: z.string().trim().optional().default(""),
  media: z
    .array(
      z.object({
        type: z.enum(["image", "gif", "video"]),
        url: z.string().trim().url("URL inválida"),
      }),
    )
    .default([]),
  isActive: z.boolean().default(true),
});

export type ExerciseInput = z.infer<typeof exerciseSchema>;
