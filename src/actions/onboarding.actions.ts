"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { assignWorkoutForUser } from "@/infrastructure/workout/assign-workout";
import { type Result, ok, err } from "@/core/shared/result";
import {
  type OnboardingInput,
  onboardingSchema,
} from "@/lib/validations/onboarding";

/**
 * Finaliza o onboarding: grava perfil, primeira medição corporal, equipamentos
 * e limitações do usuário. A ATRIBUIÇÃO DE FICHA (pipeline Selector/Validator/
 * Generator) entra na FASE 5 — aqui apenas persistimos as respostas.
 */
export async function completeOnboardingAction(
  input: OnboardingInput,
): Promise<Result<null>> {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }
  const d = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("Sessão expirada. Entre novamente.");

  // 1) Perfil
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      sex: d.sex,
      age: d.age,
      height_cm: d.height_cm,
      weight_kg: d.weight_kg,
      goal_id: d.goal_id,
      experience: d.experience,
      available_days: d.available_days,
      available_time_minutes: d.available_time_minutes,
      training_location: d.training_location,
      onboarding_completed: true,
    })
    .eq("user_id", user.id);
  if (profileError) return err("Falha ao salvar o perfil.");

  // 2) Medição inicial (baseline p/ evolução física e "peso atual")
  await supabase.from("body_measurements").insert({
    user_id: user.id,
    weight_kg: d.weight_kg,
    height_cm: d.height_cm,
  });

  // 3) Equipamentos (substitui o conjunto atual)
  await supabase.from("user_equipments").delete().eq("user_id", user.id);
  if (d.equipment_ids.length > 0) {
    const { error } = await supabase.from("user_equipments").insert(
      d.equipment_ids.map((equipment_id) => ({ user_id: user.id, equipment_id })),
    );
    if (error) return err("Falha ao salvar os equipamentos.");
  }

  // 4) Limitações (substitui o conjunto atual)
  await supabase.from("user_limitations").delete().eq("user_id", user.id);
  if (d.limitation_ids.length > 0) {
    const { error } = await supabase.from("user_limitations").insert(
      d.limitation_ids.map((limitation_id) => ({ user_id: user.id, limitation_id })),
    );
    if (error) return err("Falha ao salvar as limitações.");
  }

  // 5) Atribui a ficha pelo pipeline (Selector → Validator → Generator).
  // Não bloqueia o onboarding se falhar — o usuário pode gerar depois.
  await assignWorkoutForUser(supabase, user.id);

  return ok(null);
}
