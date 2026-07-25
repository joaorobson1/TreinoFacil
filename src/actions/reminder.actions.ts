"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/infrastructure/supabase/server";
import { type Result, ok, err } from "@/core/shared/result";

const saveSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  hour: z.coerce.number().int().min(0).max(23),
});
export type SaveReminderInput = z.infer<typeof saveSchema>;

/** Salva a inscrição de push do dispositivo e ativa o lembrete no horário escolhido. */
export async function saveReminderAction(
  input: SaveReminderInput,
): Promise<Result<null>> {
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) return err("Dados de inscrição inválidos.");
  const d = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("Sessão expirada.");

  const { error: subError } = await supabase
    .from("push_subscriptions")
    .upsert(
      { user_id: user.id, endpoint: d.endpoint, p256dh: d.p256dh, auth: d.auth },
      { onConflict: "endpoint" },
    );
  if (subError) return err("Falha ao registrar o dispositivo.");

  const { error: prefError } = await supabase
    .from("users")
    .update({ reminders_enabled: true, reminder_hour: d.hour })
    .eq("id", user.id);
  if (prefError) return err("Falha ao salvar a preferência.");

  revalidatePath("/profile");
  return ok(null);
}

/** Desativa os lembretes do usuário (mantém as inscrições para reativar depois). */
export async function disableReminderAction(): Promise<Result<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("Sessão expirada.");

  const { error } = await supabase
    .from("users")
    .update({ reminders_enabled: false })
    .eq("id", user.id);
  if (error) return err("Falha ao desativar.");

  revalidatePath("/profile");
  return ok(null);
}
