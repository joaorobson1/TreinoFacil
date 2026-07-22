import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import {
  type ProgramMetaInitial,
  ProgramMetaForm,
} from "@/components/admin/program-meta-form";
import {
  type PhaseRow,
  ProgramPhasesEditor,
} from "@/components/admin/program-phases-editor";

export const metadata: Metadata = { title: "Admin · Editar programa" };

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: p }, { data: goals }, { data: templates }] = await Promise.all([
    supabase
      .from("programs")
      .select(
        "*, program_phases(id, phase_index, name, advance_criteria, advance_threshold, workout_templates(name))",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("goals").select("id, name").eq("is_active", true).order("sort_order"),
    supabase
      .from("workout_templates")
      .select("id, name")
      .eq("is_active", true)
      .order("name"),
  ]);

  if (!p) notFound();

  const initial: ProgramMetaInitial = {
    id: p.id,
    name: p.name,
    goalId: p.goal_id,
    experience: p.experience,
    isActive: p.is_active,
  };

  const phases: PhaseRow[] = [...(p.program_phases ?? [])]
    .sort((a, b) => a.phase_index - b.phase_index)
    .map((ph) => ({
      id: ph.id,
      phaseIndex: ph.phase_index,
      name: ph.name,
      templateName: ph.workout_templates?.name ?? "?",
      criteria: ph.advance_criteria,
      threshold: ph.advance_threshold,
    }));

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <h1 className="text-xl font-bold tracking-tight">Editar programa</h1>
        <ProgramMetaForm goals={goals ?? []} initial={initial} />
      </div>
      <ProgramPhasesEditor programId={p.id} phases={phases} templates={templates ?? []} />
    </div>
  );
}
