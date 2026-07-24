import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { AdvanceCriteria } from "@/core/domain/enums";

type DB = SupabaseClient<Database>;

export type ProgramPhaseView = {
  index: number;
  name: string;
  criteria: AdvanceCriteria;
  threshold: number;
  status: "done" | "current" | "locked";
};

export type UserProgramView = {
  programName: string;
  currentIndex: number;
  totalPhases: number;
  phases: ProgramPhaseView[];
  /** progresso na fase atual rumo ao critério de avanço */
  progress: { done: number; target: number; kind: "workouts" | "weeks" };
};

/**
 * Estado do programa ativo do usuário para exibição: fase atual, todas as fases
 * e o progresso rumo ao próximo avanço. Espelha a lógica de
 * program-progression.ts (contagem por completed_at > phase_started_at).
 * Retorna null se o usuário não está matriculado em nenhum programa.
 */
export async function getUserProgram(
  supabase: DB,
  userId: string,
): Promise<UserProgramView | null> {
  const { data: up } = await supabase
    .from("user_programs")
    .select(
      "current_phase_id, phase_started_at, programs(name, program_phases(id, phase_index, name, advance_criteria, advance_threshold))",
    )
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  const program = up?.programs;
  if (!up || !program) return null;

  const phases = [...(program.program_phases ?? [])].sort(
    (a, b) => a.phase_index - b.phase_index,
  );
  if (phases.length === 0) return null;

  const currentPhase = phases.find((p) => p.id === up.current_phase_id) ?? phases[0];
  const currentIndex = currentPhase.phase_index;

  let done = 0;
  const kind: "workouts" | "weeks" =
    currentPhase.advance_criteria === "time_weeks" ? "weeks" : "workouts";
  if (kind === "weeks") {
    done = Math.floor(
      (Date.now() - Date.parse(up.phase_started_at)) / (7 * 86_400_000),
    );
  } else {
    const { count } = await supabase
      .from("completed_workouts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gt("completed_at", up.phase_started_at);
    done = count ?? 0;
  }

  return {
    programName: program.name,
    currentIndex,
    totalPhases: phases.length,
    phases: phases.map((p) => ({
      index: p.phase_index,
      name: p.name,
      criteria: p.advance_criteria,
      threshold: Number(p.advance_threshold),
      status:
        p.phase_index < currentIndex
          ? "done"
          : p.phase_index === currentIndex
            ? "current"
            : "locked",
    })),
    progress: {
      done: Math.min(done, Number(currentPhase.advance_threshold)),
      target: Number(currentPhase.advance_threshold),
      kind,
    },
  };
}
