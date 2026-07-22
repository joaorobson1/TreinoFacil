"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { type Result, ok, err } from "@/core/shared/result";
import { slugify } from "@/lib/slugify";
import { type ExerciseInput, exerciseSchema } from "@/lib/validations/exercise";

type SB = Awaited<ReturnType<typeof createClient>>;

async function saveRelations(supabase: SB, exerciseId: string, d: ExerciseInput) {
  await supabase.from("exercise_equipments").delete().eq("exercise_id", exerciseId);
  await supabase.from("exercise_equipments").insert(
    d.equipmentIds.map((equipment_id) => ({
      exercise_id: exerciseId,
      equipment_id,
      is_required: true,
    })),
  );

  await supabase.from("exercise_muscle_groups").delete().eq("exercise_id", exerciseId);
  await supabase.from("exercise_muscle_groups").insert([
    { exercise_id: exerciseId, muscle_group_id: d.primaryMuscleId, role: "primary" as const },
    ...d.secondaryMuscleIds
      .filter((id) => id !== d.primaryMuscleId)
      .map((muscle_group_id) => ({
        exercise_id: exerciseId,
        muscle_group_id,
        role: "secondary" as const,
      })),
  ]);

  await supabase.from("exercise_media").delete().eq("exercise_id", exerciseId);
  if (d.media.length > 0) {
    await supabase.from("exercise_media").insert(
      d.media.map((m, i) => ({
        exercise_id: exerciseId,
        type: m.type,
        url: m.url,
        is_primary: i === 0,
        position: i,
      })),
    );
  }
}

function toRow(d: ExerciseInput) {
  return {
    name: d.name,
    description: d.description || null,
    category_id: d.categoryId,
    primary_muscle_group_id: d.primaryMuscleId,
    equipment_id: d.equipmentIds[0] ?? null,
    level: d.level,
    execution: d.execution || null,
    breathing: d.breathing || null,
    common_mistakes: d.commonMistakes || null,
    tips: d.tips || null,
    is_active: d.isActive,
  };
}

export async function createExerciseAction(
  input: ExerciseInput,
): Promise<Result<{ id: string }>> {
  const parsed = exerciseSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  const d = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercises")
    .insert({ ...toRow(d), slug: slugify(d.name) })
    .select("id")
    .single();
  if (error || !data) {
    return err(
      error?.code === "23505"
        ? "Já existe um exercício com esse nome."
        : "Falha ao criar o exercício.",
    );
  }
  await saveRelations(supabase, data.id, d);
  revalidatePath("/admin/exercises");
  return ok({ id: data.id });
}

export async function updateExerciseAction(
  id: string,
  input: ExerciseInput,
): Promise<Result<{ id: string }>> {
  const parsed = exerciseSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  const d = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("exercises").update(toRow(d)).eq("id", id);
  if (error) return err("Falha ao salvar o exercício.");
  await saveRelations(supabase, id, d);
  revalidatePath("/admin/exercises");
  revalidatePath(`/admin/exercises/${id}`);
  return ok({ id });
}

export async function toggleExerciseActiveAction(
  id: string,
  isActive: boolean,
): Promise<Result<null>> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("exercises")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) return err("Falha ao atualizar.");
  revalidatePath("/admin/exercises");
  return ok(null);
}

export async function deleteExerciseAction(id: string): Promise<Result<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("exercises").delete().eq("id", id);
  if (error) {
    return err(
      error.code === "23503"
        ? "Exercício em uso em fichas ou histórico. Desative-o em vez de excluir."
        : "Falha ao excluir.",
    );
  }
  revalidatePath("/admin/exercises");
  return ok(null);
}
