import { z } from "zod";
import { onboardingSchema } from "./onboarding";

/**
 * Edição de perfil: mesmos campos do onboarding, sem o peso (o peso passa a ser
 * acompanhado em /measurements) e com o nome editável.
 */
export const profileEditSchema = onboardingSchema.omit({ weight_kg: true }).extend({
  name: z.string().trim().min(2, "Informe seu nome").max(80, "Nome muito longo"),
});
export type ProfileEditInput = z.infer<typeof profileEditSchema>;
