import { z } from "zod";

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe seu nome")
    .max(80, "Nome muito longo"),
  email: z.string().trim().email("E-mail inválido"),
  whatsapp: z
    .string()
    .trim()
    .min(10, "WhatsApp inválido (com DDD)")
    .max(20, "WhatsApp inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
  // LGPD art. 11: dados de saúde exigem consentimento específico e destacado.
  // Precisa ser literal `true` — um checkbox desmarcado não passa.
  healthConsent: z.literal(true, {
    errorMap: () => ({
      message: "É preciso aceitar os Termos e a Política de Privacidade",
    }),
  }),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});
export type SignInInput = z.infer<typeof signInSchema>;
