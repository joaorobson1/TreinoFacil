"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { type Result, ok, err } from "@/core/shared/result";
import {
  type ProfileEditInput,
  profileEditSchema,
} from "@/lib/validations/profile";

/**
 * Atualiza o perfil e as preferências de treino do usuário. NÃO regenera a
 * ficha automaticamente: mudanças em objetivo/equipamentos/limitações passam a
 * valer no próximo "Gerar novamente" (evita apagar a ficha atual sem aviso).
 * O peso não é alterado aqui — é acompanhado em /measurements.
 */
export async function updateProfileAction(
  input: ProfileEditInput,
): Promise<Result<null>> {
  const parsed = profileEditSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  const d = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("Sessão expirada.");

  const { error: nameError } = await supabase
    .from("users")
    .update({ name: d.name })
    .eq("id", user.id);
  if (nameError) return err("Falha ao salvar o nome.");

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      sex: d.sex,
      age: d.age,
      height_cm: d.height_cm,
      goal_id: d.goal_id,
      experience: d.experience,
      available_days: d.available_days,
      available_time_minutes: d.available_time_minutes,
      training_location: d.training_location,
    })
    .eq("user_id", user.id);
  if (profileError) return err("Falha ao salvar o perfil.");

  // Equipamentos e limitações: substitui o conjunto atual.
  await supabase.from("user_equipments").delete().eq("user_id", user.id);
  if (d.equipment_ids.length > 0) {
    await supabase.from("user_equipments").insert(
      d.equipment_ids.map((equipment_id) => ({ user_id: user.id, equipment_id })),
    );
  }
  await supabase.from("user_limitations").delete().eq("user_id", user.id);
  if (d.limitation_ids.length > 0) {
    await supabase.from("user_limitations").insert(
      d.limitation_ids.map((limitation_id) => ({ user_id: user.id, limitation_id })),
    );
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return ok(null);
}
