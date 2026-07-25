"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { assignWorkoutForUser } from "@/infrastructure/workout/assign-workout";
import { type Result, err } from "@/core/shared/result";

/**
 * Gera (ou regenera) a ficha do usuário atual rodando o pipeline
 * Selector → Validator → Generator.
 */
export async function assignWorkoutAction(): Promise<
  Result<{ templateId: string; overrideCount: number }>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("Sessão expirada.");

  // Ficha ativa atual: ao regenerar, tentamos entregar uma DIFERENTE dela.
  const { data: current } = await supabase
    .from("user_workouts")
    .select("template_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  const result = await assignWorkoutForUser(supabase, user.id, {
    avoidTemplateId: current?.template_id ?? null,
  });
  if (result.ok) {
    revalidatePath("/dashboard");
    revalidatePath("/workout");
  }
  return result;
}
