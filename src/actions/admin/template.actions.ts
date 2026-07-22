"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { type Result, ok, err } from "@/core/shared/result";
import {
  type DayExerciseInput,
  type TemplateMetaInput,
  dayExerciseSchema,
  templateMetaSchema,
} from "@/lib/validations/template";

function metaToRow(d: TemplateMetaInput) {
  return {
    name: d.name,
    goal_id: d.goalId,
    experience: d.experience,
    days_per_week: d.daysPerWeek,
    session_duration_minutes: d.sessionDuration,
    min_location: d.minLocation,
    split_type: d.splitType || null,
    priority: d.priority,
    is_active: d.isActive,
  };
}

function revalidate(id?: string) {
  revalidatePath("/admin/templates");
  if (id) revalidatePath(`/admin/templates/${id}`);
}

// ---------------- FICHA (metadados) ----------------
export async function createTemplateAction(
  input: TemplateMetaInput,
): Promise<Result<{ id: string }>> {
  const parsed = templateMetaSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_templates")
    .insert(metaToRow(parsed.data))
    .select("id")
    .single();
  if (error || !data) return err("Falha ao criar a ficha.");
  revalidate();
  return ok({ id: data.id });
}

export async function updateTemplateMetaAction(
  id: string,
  input: TemplateMetaInput,
): Promise<Result<null>> {
  const parsed = templateMetaSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_templates")
    .update(metaToRow(parsed.data))
    .eq("id", id);
  if (error) return err("Falha ao salvar.");
  revalidate(id);
  return ok(null);
}

export async function deleteTemplateAction(id: string): Promise<Result<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("workout_templates").delete().eq("id", id);
  if (error) {
    return err(
      error.code === "23503"
        ? "Ficha atribuída a usuários — desative-a em vez de excluir."
        : "Falha ao excluir.",
    );
  }
  revalidate();
  return ok(null);
}

// ---------------- DIAS ----------------
export async function addDayAction(templateId: string): Promise<Result<null>> {
  const supabase = await createClient();
  const { data: last } = await supabase
    .from("workout_days")
    .select("day_index")
    .eq("template_id", templateId)
    .order("day_index", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextIndex = (last?.day_index ?? 0) + 1;
  const { error } = await supabase.from("workout_days").insert({
    template_id: templateId,
    day_index: nextIndex,
    name: `Dia ${String.fromCharCode(64 + nextIndex)}`,
  });
  if (error) return err("Falha ao adicionar o dia.");
  revalidate(templateId);
  return ok(null);
}

export async function updateDayAction(
  dayId: string,
  templateId: string,
  values: { name: string; focus: string },
): Promise<Result<null>> {
  if (values.name.trim().length < 1) return err("Informe o nome do dia.");
  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_days")
    .update({ name: values.name.trim(), focus: values.focus.trim() || null })
    .eq("id", dayId);
  if (error) return err("Falha ao salvar o dia.");
  revalidate(templateId);
  return ok(null);
}

export async function deleteDayAction(
  dayId: string,
  templateId: string,
): Promise<Result<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("workout_days").delete().eq("id", dayId);
  if (error) return err("Falha ao excluir o dia.");
  revalidate(templateId);
  return ok(null);
}

// ---------------- EXERCÍCIOS DO DIA ----------------
export async function addDayExerciseAction(
  dayId: string,
  templateId: string,
  input: DayExerciseInput,
): Promise<Result<null>> {
  const parsed = dayExerciseSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const supabase = await createClient();
  const { data: last } = await supabase
    .from("workout_exercises")
    .select("position")
    .eq("workout_day_id", dayId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPos = (last?.position ?? 0) + 1;

  const { error } = await supabase.from("workout_exercises").insert({
    workout_day_id: dayId,
    exercise_id: parsed.data.exerciseId,
    position: nextPos,
    sets: parsed.data.sets,
    reps: parsed.data.reps,
    rest_seconds: parsed.data.rest,
  });
  if (error) return err("Falha ao adicionar o exercício.");
  revalidate(templateId);
  return ok(null);
}

export async function updateDayExerciseAction(
  weId: string,
  templateId: string,
  values: { sets: number; reps: string; rest: number },
): Promise<Result<null>> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_exercises")
    .update({ sets: values.sets, reps: values.reps.trim(), rest_seconds: values.rest })
    .eq("id", weId);
  if (error) return err("Falha ao salvar o exercício.");
  revalidate(templateId);
  return ok(null);
}

export async function deleteDayExerciseAction(
  weId: string,
  templateId: string,
): Promise<Result<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("workout_exercises").delete().eq("id", weId);
  if (error) return err("Falha ao excluir o exercício.");
  revalidate(templateId);
  return ok(null);
}
