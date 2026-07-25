"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { type Result, ok, err } from "@/core/shared/result";

/**
 * Exporta os dados pessoais do usuário (LGPD art. 18 — portabilidade).
 * Retorna um objeto que o cliente baixa como JSON. Cada consulta é filtrada
 * pelo próprio usuário (RLS + user_id).
 */
export async function exportMyDataAction(): Promise<Result<{ data: unknown }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("Sessão expirada.");
  const uid = user.id;

  const [
    account,
    profile,
    measurements,
    stats,
    equipments,
    limitations,
    completed,
    exerciseProgress,
    achievements,
  ] = await Promise.all([
    supabase.from("users").select("name, email, whatsapp, created_at, terms_accepted_at, health_consent_at").eq("id", uid).maybeSingle(),
    supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
    supabase.from("body_measurements").select("*").eq("user_id", uid).order("measured_at"),
    supabase.from("user_stats").select("*").eq("user_id", uid).maybeSingle(),
    supabase.from("user_equipments").select("equipments(name)").eq("user_id", uid),
    supabase.from("user_limitations").select("limitations(name)").eq("user_id", uid),
    supabase.from("completed_workouts").select("completed_at, duration_seconds, total_volume, workout_days(name)").eq("user_id", uid).order("completed_at"),
    supabase.from("exercise_progress").select("performed_on, top_weight_kg, best_e1rm, total_sets, total_reps, exercises(name)").eq("user_id", uid).order("performed_on"),
    supabase.from("user_achievements").select("unlocked_at, achievements(name)").eq("user_id", uid),
  ]);

  return ok({
    data: {
      exportadoEm: new Date().toISOString(),
      conta: account.data,
      perfil: profile.data,
      medidas: measurements.data ?? [],
      estatisticas: stats.data,
      equipamentos: (equipments.data ?? []).map((e) => e.equipments?.name).filter(Boolean),
      limitacoes: (limitations.data ?? []).map((l) => l.limitations?.name).filter(Boolean),
      treinosConcluidos: completed.data ?? [],
      evolucaoPorExercicio: exerciseProgress.data ?? [],
      conquistas: (achievements.data ?? []).map((a) => ({
        nome: a.achievements?.name,
        desbloqueadaEm: a.unlocked_at,
      })),
    },
  });
}

/**
 * Exclui permanentemente a conta do usuário e todos os dados associados.
 * A remoção do usuário no Auth cascateia para public.users e daí para todas as
 * tabelas de dono (FKs on delete cascade). Irreversível.
 */
export async function deleteMyAccountAction(): Promise<Result<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("Sessão expirada.");

  // Só o próprio dono chega aqui (id vem da sessão autenticada).
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return err("Falha ao excluir a conta. Tente novamente.");

  await supabase.auth.signOut();
  return ok(null);
}
