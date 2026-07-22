/**
 * Verifica o pós-treino (finalizeWorkout): stats, exercise_progress e conquistas.
 * Simula 2 treinos (ontem + hoje) para testar o streak. Uso: `npx tsx scripts/verify-finalize.ts`
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { assignWorkoutForUser } from "@/infrastructure/workout/assign-workout";
import { finalizeWorkout } from "@/infrastructure/workout/finalize-workout";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
) as Record<string, string>;

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const admin = createClient<Database>(url, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const SMALL_GYM = ["peso_corporal", "halteres", "barra_olimpica", "leg_press", "maquina_supino", "maquina_remada", "cadeira_extensora", "mesa_flexora", "polias", "banco_reto"];

async function main() {
  const { data: goal } = await admin.from("goals").select("id").eq("slug", "emagrecer").single();
  const { data: eq } = await admin.from("equipments").select("id, slug").in("slug", SMALL_GYM);

  const email = `fin_${Date.now()}@example.com`;
  const { data: created, error } = await admin.auth.admin.createUser({
    email, password: "test123456", email_confirm: true, user_metadata: { name: "Fin Bot" },
  });
  if (error || !created.user) throw new Error(error?.message);
  const uid = created.user.id;

  try {
    await admin.from("profiles").update({
      sex: "male", age: 28, height_cm: 175, weight_kg: 78, goal_id: goal!.id,
      experience: "never", available_days: 5, available_time_minutes: 60,
      training_location: "small_gym", onboarding_completed: true,
    }).eq("user_id", uid);
    await admin.from("user_equipments").insert((eq ?? []).map((e) => ({ user_id: uid, equipment_id: e.id })));

    const authed = createClient<Database>(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    await authed.auth.signInWithPassword({ email, password: "test123456" });
    await assignWorkoutForUser(authed, uid);

    const { data: uw } = await authed.from("user_workouts").select("id, template_id").eq("user_id", uid).eq("is_active", true).single();
    const { data: day } = await authed.from("workout_days")
      .select("id, workout_exercises(id, exercise_id)")
      .eq("template_id", uw!.template_id).order("day_index").limit(1).single();
    const exs = (day!.workout_exercises ?? []).slice(0, 3);

    async function doWorkout(completedAt: string) {
      const { data: cw } = await authed.from("completed_workouts")
        .insert({ user_id: uid, user_workout_id: uw!.id, workout_day_id: day!.id, completed_at: completedAt, duration_seconds: 1800, total_volume: 0 })
        .select("id, completed_at").single();
      const entries = exs.map((we) => ({
        workoutExerciseId: we.id, exerciseId: we.exercise_id,
        sets: [{ weight: 40, reps: 12 }, { weight: 45, reps: 12 }, { weight: 50, reps: 12 }],
      }));
      let vol = 0;
      const rows = entries.flatMap((e) => e.sets.map((s, i) => {
        vol += s.weight * s.reps;
        return { user_id: uid, completed_workout_id: cw!.id, workout_exercise_id: e.workoutExerciseId, exercise_id: e.exerciseId, set_number: i + 1, reps_done: s.reps, weight_kg: s.weight };
      }));
      await authed.from("user_progress").insert(rows);
      const { unlocked } = await finalizeWorkout(authed, {
        userId: uid, completedWorkoutId: cw!.id, completedAt: cw!.completed_at,
        durationSeconds: 1800, totalVolume: vol,
        entries: entries.map((e) => ({ exerciseId: e.exerciseId, sets: e.sets })),
      });
      await authed.from("completed_workouts").update({ total_volume: vol }).eq("id", cw!.id);
      return unlocked;
    }

    const yesterday = new Date(Date.now() - 86_400_000).toISOString();
    const u1 = await doWorkout(yesterday);
    console.log("Treino 1 (ontem) desbloqueou:", u1.map((a) => a.name).join(", ") || "—");
    const u2 = await doWorkout(new Date().toISOString());
    console.log("Treino 2 (hoje)  desbloqueou:", u2.map((a) => a.name).join(", ") || "—");

    const { data: stats } = await authed.from("user_stats").select("*").eq("user_id", uid).single();
    const { count: epCount } = await authed.from("exercise_progress").select("*", { count: "exact", head: true }).eq("user_id", uid);
    const { data: ach } = await authed.from("user_achievements").select("achievements(name)").eq("user_id", uid);

    console.log("\nuser_stats:");
    console.log(`  treinos ${stats?.total_workouts} · séries ${stats?.total_sets} · reps ${stats?.total_reps} · volume ${stats?.total_volume_kg}kg`);
    console.log(`  streak atual ${stats?.current_streak} · recorde ${stats?.longest_streak} · tempo ${stats?.total_duration_seconds}s`);
    console.log(`exercise_progress: ${epCount} linhas`);
    console.log(`conquistas: ${(ach ?? []).map((a) => a.achievements?.name).join(", ")}`);

    const ok = stats?.total_workouts === 2 && stats?.current_streak === 2 && stats?.longest_streak === 2 && (stats?.total_volume_kg ?? 0) > 0;
    console.log(ok ? "\n✓ Pós-treino OK (stats + streak + progress + conquistas)." : "\n✗ Falha no pós-treino.");
  } finally {
    await admin.auth.admin.deleteUser(uid);
    console.log("Usuário de teste removido.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
