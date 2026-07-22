/**
 * Verifica o caminho de conclusão de treino (RLS + FKs): atribui uma ficha,
 * grava completed_workouts + user_progress como usuário autenticado e lê de volta.
 * Uso: `npx tsx scripts/verify-session.ts`
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { assignWorkoutForUser } from "@/infrastructure/workout/assign-workout";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
) as Record<string, string>;

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const admin = createClient<Database>(url, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const SMALL_GYM = ["peso_corporal", "halteres", "barra_olimpica", "leg_press",
  "maquina_supino", "maquina_remada", "cadeira_extensora", "mesa_flexora", "polias", "banco_reto"];

async function main() {
  const { data: goal } = await admin.from("goals").select("id").eq("slug", "emagrecer").single();
  const { data: eq } = await admin.from("equipments").select("id, slug").in("slug", SMALL_GYM);

  const email = `sess_${Date.now()}@example.com`;
  const { data: created, error } = await admin.auth.admin.createUser({
    email, password: "test123456", email_confirm: true, user_metadata: { name: "Sess Bot" },
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

    const authed = createClient<Database>(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    await authed.auth.signInWithPassword({ email, password: "test123456" });

    // atribui ficha
    const assign = await assignWorkoutForUser(authed, uid);
    if (!assign.ok) throw new Error("assign: " + assign.error);

    const { data: uw } = await authed.from("user_workouts")
      .select("id, template_id").eq("user_id", uid).eq("is_active", true).single();
    const { data: day } = await authed.from("workout_days")
      .select("id, name, workout_exercises(id, exercise_id)")
      .eq("template_id", uw!.template_id).order("day_index").limit(1).single();

    const exs = (day!.workout_exercises ?? []).slice(0, 4);

    // mimic completeWorkoutAction (mesmos inserts, sob RLS)
    let volume = 0;
    const { data: cw, error: cwErr } = await authed.from("completed_workouts").insert({
      user_id: uid, user_workout_id: uw!.id, workout_day_id: day!.id,
      duration_seconds: 1800, total_volume: 0,
    }).select("id").single();
    if (cwErr) throw new Error("completed_workouts: " + cwErr.message);

    const rows = exs.flatMap((we) =>
      [0, 1, 2].map((i) => {
        const weight = 20 + i * 5;
        const reps = 12;
        volume += weight * reps;
        return {
          user_id: uid, completed_workout_id: cw!.id, workout_exercise_id: we.id,
          exercise_id: we.exercise_id, set_number: i + 1, reps_done: reps, weight_kg: weight,
        };
      }),
    );
    const { error: upErr } = await authed.from("user_progress").insert(rows);
    if (upErr) throw new Error("user_progress: " + upErr.message);
    await authed.from("completed_workouts").update({ total_volume: volume }).eq("id", cw!.id);

    // leitura de volta
    const { count: cwCount } = await authed.from("completed_workouts")
      .select("*", { count: "exact", head: true }).eq("user_id", uid);
    const { count: upCount } = await authed.from("user_progress")
      .select("*", { count: "exact", head: true }).eq("user_id", uid);

    console.log("ficha :", uw!.template_id ? "atribuída" : "—");
    console.log("dia   :", day!.name, `(${exs.length} exercícios registrados)`);
    console.log("completed_workouts:", cwCount, "| volume:", volume, "kg");
    console.log("user_progress séries:", upCount);
    console.log(cwCount === 1 && (upCount ?? 0) === rows.length ? "\n✓ Sessão salva corretamente (RLS + FKs)." : "\n✗ Falha na persistência.");
  } finally {
    await admin.auth.admin.deleteUser(uid);
    console.log("Usuário de teste removido.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
