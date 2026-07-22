import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import {
  type TemplateMetaInitial,
  TemplateMetaForm,
} from "@/components/admin/template-meta-form";
import {
  type DayData,
  TemplateDaysEditor,
} from "@/components/admin/template-days-editor";

export const metadata: Metadata = { title: "Admin · Editar ficha" };

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: t }, { data: goals }, { data: catalog }] = await Promise.all([
    supabase
      .from("workout_templates")
      .select(
        "*, workout_days(id, day_index, name, focus, workout_exercises(id, position, sets, reps, rest_seconds, exercises(id, name)))",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("goals").select("id, name").eq("is_active", true).order("sort_order"),
    supabase.from("exercises").select("id, name").eq("is_active", true).order("name"),
  ]);

  if (!t) notFound();

  const initial: TemplateMetaInitial = {
    id: t.id,
    name: t.name,
    goalId: t.goal_id,
    experience: t.experience,
    daysPerWeek: t.days_per_week,
    sessionDuration: t.session_duration_minutes,
    minLocation: t.min_location,
    splitType: t.split_type ?? "",
    priority: t.priority,
    isActive: t.is_active,
  };

  const days: DayData[] = [...t.workout_days]
    .sort((a, b) => a.day_index - b.day_index)
    .map((d) => ({
      id: d.id,
      name: d.name,
      focus: d.focus ?? "",
      exercises: [...d.workout_exercises]
        .sort((a, b) => a.position - b.position)
        .map((we) => ({
          id: we.id,
          sets: we.sets,
          reps: we.reps,
          rest: we.rest_seconds,
          name: we.exercises?.name ?? "?",
        })),
    }));

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <h1 className="text-xl font-bold tracking-tight">Editar ficha</h1>
        <TemplateMetaForm goals={goals ?? []} initial={initial} />
      </div>
      <TemplateDaysEditor templateId={t.id} days={days} catalog={catalog ?? []} />
    </div>
  );
}
