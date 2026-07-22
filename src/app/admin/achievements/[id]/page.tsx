import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import {
  type AchievementInitial,
  AchievementForm,
} from "@/components/admin/achievement-form";

export const metadata: Metadata = { title: "Admin · Editar conquista" };

export default async function EditAchievementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: a } = await supabase
    .from("achievements")
    .select("*")
    .eq("id", Number(id))
    .maybeSingle();

  if (!a) notFound();

  const initial: AchievementInitial = {
    id: a.id,
    name: a.name,
    description: a.description ?? "",
    icon: a.icon ?? "",
    criteria: a.criteria,
    threshold: Number(a.threshold),
    tier: a.tier,
    sortOrder: a.sort_order,
    isActive: a.is_active,
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold tracking-tight">Editar conquista</h1>
      <AchievementForm initial={initial} />
    </div>
  );
}
