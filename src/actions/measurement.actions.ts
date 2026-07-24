"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { type Result, ok, err } from "@/core/shared/result";
import {
  type MeasurementInput,
  measurementSchema,
} from "@/lib/validations/measurement";

/** Registra uma nova medição corporal do próprio usuário (RLS: user_id = auth.uid()). */
export async function addMeasurementAction(
  input: MeasurementInput,
): Promise<Result<null>> {
  const parsed = measurementSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  const d = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("Sessão expirada.");

  const { error } = await supabase.from("body_measurements").insert({
    user_id: user.id,
    weight_kg: d.weight_kg,
    waist_cm: d.waist_cm,
    body_fat_pct: d.body_fat_pct,
    notes: d.notes || null,
  });
  if (error) return err("Falha ao registrar a medida.");

  revalidatePath("/measurements");
  revalidatePath("/dashboard");
  return ok(null);
}
