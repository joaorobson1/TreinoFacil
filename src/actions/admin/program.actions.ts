"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { type Result, ok, err } from "@/core/shared/result";
import { slugify } from "@/lib/slugify";
import {
  type PhaseInput,
  type ProgramMetaInput,
  phaseSchema,
  programMetaSchema,
} from "@/lib/validations/program";

function revalidate(id?: string) {
  revalidatePath("/admin/programs");
  if (id) revalidatePath(`/admin/programs/${id}`);
}

// ---------------- PROGRAMA ----------------
export async function createProgramAction(
  input: ProgramMetaInput,
): Promise<Result<{ id: string }>> {
  const parsed = programMetaSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  const d = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .insert({
      name: d.name,
      slug: slugify(d.name),
      goal_id: d.goalId,
      experience: d.experience,
      is_active: d.isActive,
    })
    .select("id")
    .single();
  if (error || !data) {
    return err(error?.code === "23505" ? "Já existe um programa com esse nome." : "Falha ao criar.");
  }
  revalidate();
  return ok({ id: data.id });
}

export async function updateProgramMetaAction(
  id: string,
  input: ProgramMetaInput,
): Promise<Result<null>> {
  const parsed = programMetaSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  const d = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("programs")
    .update({ name: d.name, goal_id: d.goalId, experience: d.experience, is_active: d.isActive })
    .eq("id", id);
  if (error) return err("Falha ao salvar.");
  revalidate(id);
  return ok(null);
}

export async function deleteProgramAction(id: string): Promise<Result<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("programs").delete().eq("id", id);
  if (error) {
    return err(
      error.code === "23503"
        ? "Programa em uso por usuários — desative-o em vez de excluir."
        : "Falha ao excluir.",
    );
  }
  revalidate();
  return ok(null);
}

// ---------------- FASES ----------------
export async function addPhaseAction(
  programId: string,
  input: PhaseInput,
): Promise<Result<null>> {
  const parsed = phaseSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  const d = parsed.data;

  const supabase = await createClient();
  const { data: last } = await supabase
    .from("program_phases")
    .select("phase_index")
    .eq("program_id", programId)
    .order("phase_index", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextIndex = (last?.phase_index ?? 0) + 1;

  const { error } = await supabase.from("program_phases").insert({
    program_id: programId,
    phase_index: nextIndex,
    name: d.name,
    template_id: d.templateId,
    advance_criteria: d.advanceCriteria,
    advance_threshold: d.advanceThreshold,
    duration_weeks: d.durationWeeks,
  });
  if (error) return err("Falha ao adicionar a fase.");
  revalidate(programId);
  return ok(null);
}

export async function deletePhaseAction(
  phaseId: string,
  programId: string,
): Promise<Result<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("program_phases").delete().eq("id", phaseId);
  if (error) {
    return err(
      error.code === "23503" ? "Fase referenciada por usuários." : "Falha ao excluir a fase.",
    );
  }
  revalidate(programId);
  return ok(null);
}
