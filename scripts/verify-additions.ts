/**
 * Verifica adicionar/remover exercício na ficha (user_workout_additions) sob RLS.
 * Uso: `npx tsx scripts/verify-additions.ts`
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { assignWorkoutForUser } from "@/infrastructure/workout/assign-workout";

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
  const { data: extra } = await admin.from("exercises").select("id").eq("slug", "prancha").single();

  const email = `add_${Date.now()}@example.com`;
  const { data: created } = await admin.auth.admin.createUser({ email, password: "test123456", email_confirm: true, user_metadata: { name: "Add Bot" } });
  const uid = created.user!.id;

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
    const { data: day } = await authed.from("workout_days").select("id, name").eq("template_id", uw!.template_id).order("day_index").limit(1).single();

    // adiciona (sob RLS)
    const ins = await authed.from("user_workout_additions").insert({
      user_id: uid, user_workout_id: uw!.id, workout_day_id: day!.id,
      exercise_id: extra!.id, sets: 4, reps: "15", rest_seconds: 45,
    }).select("id").single();
    console.log("adicionar exercício ao dia:", ins.error ? `BLOQUEADO (${ins.error.message})` : "OK ✓");

    const { count: after } = await authed.from("user_workout_additions").select("*", { count: "exact", head: true }).eq("workout_day_id", day!.id);
    console.log(`adicionados no dia "${day!.name}": ${after}`);

    // outro usuário NÃO enxerga a adição (RLS)
    const other = createClient<Database>(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const oe = `other_${Date.now()}@example.com`;
    const oc = await admin.auth.admin.createUser({ email: oe, password: "test123456", email_confirm: true });
    await other.auth.signInWithPassword({ email: oe, password: "test123456" });
    const { count: leak } = await other.from("user_workout_additions").select("*", { count: "exact", head: true }).eq("workout_day_id", day!.id);
    console.log("outro usuário enxerga a adição:", leak ? "SIM ✗ (vazou!)" : "não ✓ (RLS)");
    await admin.auth.admin.deleteUser(oc.data.user!.id);

    // remove
    await authed.from("user_workout_additions").delete().eq("id", ins.data!.id);
    const { count: final } = await authed.from("user_workout_additions").select("*", { count: "exact", head: true }).eq("workout_day_id", day!.id);
    console.log(`após remover: ${final}`);

    const ok = !ins.error && after === 1 && !leak && final === 0;
    console.log(ok ? "\n✓ Adicionar/remover exercício OK (RLS)." : "\n✗ Falha.");
  } finally {
    await admin.auth.admin.deleteUser(uid);
    console.log("Limpeza concluída.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
