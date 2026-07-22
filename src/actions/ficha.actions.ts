"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { type Result, ok, err } from "@/core/shared/result";
import { type DayExerciseInput, dayExerciseSchema } from "@/lib/validations/template";

/**
 * Adiciona um exercício extra a um dia da ficha ativa do usuário
 * (além dos que vêm do template).
 */
export async function addWorkoutExerciseAction(
  dayId: string,
  input: DayExerciseInput,
): Promise<Result<null>> {
  const parsed = dayExerciseSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("Sessão expirada.");

  const { data: uw } = await supabase
    .from("user_workouts")
    .select("id, template_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();
  if (!uw) return err("Você ainda não tem uma ficha.");

  // o dia precisa pertencer à ficha ativa
  const { data: day } = await supabase
    .from("workout_days")
    .select("id")
    .eq("id", dayId)
    .eq("template_id", uw.template_id)
    .maybeSingle();
  if (!day) return err("Dia inválido.");

  const { error } = await supabase.from("user_workout_additions").insert({
    user_id: user.id,
    user_workout_id: uw.id,
    workout_day_id: dayId,
    exercise_id: parsed.data.exerciseId,
    sets: parsed.data.sets,
    reps: parsed.data.reps,
    rest_seconds: parsed.data.rest,
  });
  if (error) return err("Falha ao adicionar o exercício.");

  revalidatePath("/workout");
  revalidatePath("/dashboard");
  return ok(null);
}

export async function removeWorkoutExerciseAction(
  additionId: string,
): Promise<Result<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("Sessão expirada.");

  const { error } = await supabase
    .from("user_workout_additions")
    .delete()
    .eq("id", additionId)
    .eq("user_id", user.id);
  if (error) return err("Falha ao remover o exercício.");

  revalidatePath("/workout");
  revalidatePath("/dashboard");
  return ok(null);
}
