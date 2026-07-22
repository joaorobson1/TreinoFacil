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

  const result = await assignWorkoutForUser(supabase, user.id);
  if (result.ok) {
    revalidatePath("/dashboard");
    revalidatePath("/workout");
  }
  return result;
}
