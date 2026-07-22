import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  evaluateTemplate,
  loadExercisePool,
  loadUserContext,
  persistAssignment,
} from "./assign-workout";

type DB = SupabaseClient<Database>;

/**
 * Progressão automática de programa (sem IA): ao concluir um treino, avalia se o
 * critério da fase atual foi atingido e, se sim, avança para a próxima fase —
 * reatribuindo a ficha à ficha da nova fase. Ver docs/03-FLUXOS-E-REGRAS.md §5.
 */
export async function evaluateProgramProgression(
  supabase: DB,
  userId: string,
  completedAt: string,
): Promise<{ advanced: boolean; completed: boolean }> {
  const { data: up } = await supabase
    .from("user_programs")
    .select("id, program_id, current_phase_id, phase_started_at")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();
  if (!up?.current_phase_id) return { advanced: false, completed: false };

  const { data: phase } = await supabase
    .from("program_phases")
    .select("phase_index, advance_criteria, advance_threshold")
    .eq("id", up.current_phase_id)
    .single();
  if (!phase) return { advanced: false, completed: false };

  const threshold = Number(phase.advance_threshold);
  let met = false;
  if (phase.advance_criteria === "time_weeks") {
    const weeks = (Date.now() - Date.parse(up.phase_started_at)) / (7 * 86_400_000);
    met = weeks >= threshold;
  } else {
    // workouts_completed / completion_pct → nº de treinos concluídos na fase.
    // gt (não gte): ao avançar, phase_started_at = completed_at do treino-gatilho,
    // que não deve ser recontado na fase seguinte.
    const { count } = await supabase
      .from("completed_workouts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gt("completed_at", up.phase_started_at);
    met = (count ?? 0) >= threshold;
  }
  if (!met) return { advanced: false, completed: false };

  const { data: next } = await supabase
    .from("program_phases")
    .select("id, template_id")
    .eq("program_id", up.program_id)
    .eq("phase_index", phase.phase_index + 1)
    .maybeSingle();

  // última fase → programa concluído
  if (!next) {
    await supabase
      .from("user_programs")
      .update({ status: "completed", is_active: false })
      .eq("id", up.id);
    return { advanced: false, completed: true };
  }

  // avança e reatribui a ficha da próxima fase
  await supabase
    .from("user_programs")
    .update({ current_phase_id: next.id, phase_started_at: completedAt })
    .eq("id", up.id);

  const ctx = await loadUserContext(supabase, userId);
  const pool = await loadExercisePool(supabase);
  if (ctx) {
    const { overrides } = await evaluateTemplate(supabase, next.template_id, pool, ctx);
    await persistAssignment(supabase, userId, next.template_id, overrides, {
      source: "algorithm",
      programId: up.id,
      phaseId: next.id,
    });
  }
  return { advanced: true, completed: false };
}
