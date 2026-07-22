import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { ExerciseList } from "@/components/admin/exercise-list";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Exercícios" };

export default async function AdminExercisesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exercises")
    .select("id, name, level, is_active, muscle_groups(name)")
    .order("name");

  const exercises = (data ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    level: e.level,
    isActive: e.is_active,
    muscle: e.muscle_groups?.name ?? "—",
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Exercícios</h1>
        <Link
          href="/admin/exercises/new"
          className={cn(buttonVariants(), "h-10 rounded-xl")}
        >
          <Plus className="size-4" />
          Novo
        </Link>
      </div>
      <ExerciseList exercises={exercises} />
    </div>
  );
}
