import type { Metadata } from "next";
import { createClient } from "@/infrastructure/supabase/server";
import { ExerciseForm } from "@/components/admin/exercise-form";

export const metadata: Metadata = { title: "Admin · Novo exercício" };

export default async function NewExercisePage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: muscles }, { data: equipments }] =
    await Promise.all([
      supabase.from("exercise_categories").select("id, name").order("name"),
      supabase.from("muscle_groups").select("id, name").order("name"),
      supabase.from("equipments").select("id, name").order("name"),
    ]);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold tracking-tight">Novo exercício</h1>
      <ExerciseForm
        categories={categories ?? []}
        muscles={muscles ?? []}
        equipments={equipments ?? []}
      />
    </div>
  );
}
