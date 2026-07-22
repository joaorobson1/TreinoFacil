import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import {
  type ExerciseInitial,
  ExerciseForm,
} from "@/components/admin/exercise-form";

export const metadata: Metadata = { title: "Admin · Editar exercício" };

export default async function EditExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: categories }, { data: muscles }, { data: equipments }, { data: ex }] =
    await Promise.all([
      supabase.from("exercise_categories").select("id, name").order("name"),
      supabase.from("muscle_groups").select("id, name").order("name"),
      supabase.from("equipments").select("id, name").order("name"),
      supabase
        .from("exercises")
        .select(
          "*, exercise_equipments(equipment_id), exercise_muscle_groups(muscle_group_id, role), exercise_media(type, url, is_primary, position)",
        )
        .eq("id", id)
        .maybeSingle(),
    ]);

  if (!ex) notFound();

  const initial: ExerciseInitial = {
    id: ex.id,
    name: ex.name,
    description: ex.description ?? "",
    categoryId: ex.category_id,
    primaryMuscleId: ex.primary_muscle_group_id ?? 0,
    level: ex.level,
    equipmentIds: (ex.exercise_equipments ?? []).map((e) => e.equipment_id),
    secondaryMuscleIds: (ex.exercise_muscle_groups ?? [])
      .filter((m) => m.role === "secondary")
      .map((m) => m.muscle_group_id),
    execution: ex.execution ?? "",
    breathing: ex.breathing ?? "",
    commonMistakes: ex.common_mistakes ?? "",
    tips: ex.tips ?? "",
    media: [...(ex.exercise_media ?? [])]
      .sort(
        (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
      )
      .map((m) => ({ type: m.type, url: m.url })),
    isActive: ex.is_active,
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold tracking-tight">Editar exercício</h1>
      <ExerciseForm
        categories={categories ?? []}
        muscles={muscles ?? []}
        equipments={equipments ?? []}
        initial={initial}
      />
    </div>
  );
}
