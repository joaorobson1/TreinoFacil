"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { type Result, ok, err } from "@/core/shared/result";
import { slugify } from "@/lib/slugify";
import {
  type AchievementInput,
  achievementSchema,
} from "@/lib/validations/achievement";

function toRow(d: AchievementInput) {
  return {
    name: d.name,
    description: d.description || null,
    icon: d.icon || null,
    criteria: d.criteria,
    threshold: d.threshold,
    tier: d.tier,
    sort_order: d.sortOrder,
    is_active: d.isActive,
  };
}

export async function createAchievementAction(
  input: AchievementInput,
): Promise<Result<{ id: number }>> {
  const parsed = achievementSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("achievements")
    .insert({ ...toRow(parsed.data), slug: slugify(parsed.data.name) })
    .select("id")
    .single();
  if (error || !data) {
    return err(
      error?.code === "23505" ? "Já existe uma conquista com esse nome." : "Falha ao criar.",
    );
  }
  revalidatePath("/admin/achievements");
  return ok({ id: data.id });
}

export async function updateAchievementAction(
  id: number,
  input: AchievementInput,
): Promise<Result<null>> {
  const parsed = achievementSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const supabase = await createClient();
  const { error } = await supabase.from("achievements").update(toRow(parsed.data)).eq("id", id);
  if (error) return err("Falha ao salvar.");
  revalidatePath("/admin/achievements");
  return ok(null);
}

export async function deleteAchievementAction(id: number): Promise<Result<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("achievements").delete().eq("id", id);
  if (error) {
    return err(
      error.code === "23503"
        ? "Conquista já desbloqueada por usuários — desative-a em vez de excluir."
        : "Falha ao excluir.",
    );
  }
  revalidatePath("/admin/achievements");
  return ok(null);
}
