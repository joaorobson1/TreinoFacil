/**
 * Verifica o pipeline real de atribuição (Selector → Validator → Generator).
 * Cria um usuário de teste, roda assignWorkoutForUser e inspeciona o resultado.
 * Uso: `npx tsx scripts/verify-assign.ts`
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

const admin = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

async function main() {
  const { data: goal } = await admin.from("goals").select("id").eq("slug", "hipertrofia").single();
  const { data: knee } = await admin.from("limitations").select("id").eq("slug", "dor_joelho").single();
  const { data: equips } = await admin.from("equipments").select("id");

  const email = `assign_${Date.now()}@example.com`;
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password: "test123456",
    email_confirm: true,
    user_metadata: { name: "Assign Bot" },
  });
  if (error || !created.user) throw new Error(error?.message ?? "createUser falhou");
  const uid = created.user.id;
  console.log("Perfil: hipertrofia • iniciante • 4 dias • academia completa • dor no joelho\n");

  try {
    await admin
      .from("profiles")
      .update({
        sex: "male", age: 30, height_cm: 180, weight_kg: 80,
        goal_id: goal!.id, experience: "never", available_days: 4,
        available_time_minutes: 60, training_location: "full_gym",
        onboarding_completed: true,
      })
      .eq("user_id", uid);
    await admin.from("user_equipments").insert(
      (equips ?? []).map((e) => ({ user_id: uid, equipment_id: e.id })),
    );
    await admin.from("user_limitations").insert({ user_id: uid, limitation_id: knee!.id });

    // roda o pipeline com um cliente AUTENTICADO (sob RLS) — caminho real do botão
    const authed = createClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } },
    );
    const { error: signInErr } = await authed.auth.signInWithPassword({
      email,
      password: "test123456",
    });
    if (signInErr) throw new Error(`signin: ${signInErr.message}`);

    const res = await assignWorkoutForUser(authed, uid);
    console.log("Resultado (sob RLS):", res.ok ? "OK" : `ERRO — ${res.error}`);
    if (!res.ok) return;

    const { data: uw } = await admin
      .from("user_workouts")
      .select("id, source, workout_templates(name)")
      .eq("user_id", uid)
      .eq("is_active", true)
      .single();
    console.log("Ficha selecionada:", uw?.workout_templates?.name);
    console.log("Origem:", uw?.source);

    const { data: ovs } = await admin
      .from("user_workout_overrides")
      .select("reason, workout_exercise_id, substitute_exercise_id")
      .eq("user_workout_id", uw!.id);

    console.log(`\nSubstituições (${ovs?.length ?? 0}):`);
    const weMap: Record<string, string> = {};
    if (ovs?.length) {
      const { data: wes } = await admin
        .from("workout_exercises")
        .select("id, exercises(name)")
        .in("id", ovs.map((o) => o.workout_exercise_id));
      for (const w of wes ?? []) weMap[w.id] = w.exercises?.name ?? "?";

      const subIds = ovs.map((o) => o.substitute_exercise_id).filter(Boolean) as string[];
      const subMap: Record<string, string> = {};
      if (subIds.length) {
        const { data: subs } = await admin.from("exercises").select("id, name").in("id", subIds);
        for (const s of subs ?? []) subMap[s.id] = s.name;
      }
      for (const o of ovs) {
        const from = weMap[o.workout_exercise_id];
        const to = o.substitute_exercise_id ? subMap[o.substitute_exercise_id] : "❌ REMOVIDO";
        console.log(`  [${o.reason}] ${from} → ${to}`);
      }
    }

    const expected = "Hipertrofia • Iniciante • 4 dias (academia)";
    console.log(
      "\n" +
        (uw?.workout_templates?.name === expected
          ? "✓ Selecionou a ficha esperada do brief."
          : "✗ Ficha inesperada."),
    );
  } finally {
    await admin.auth.admin.deleteUser(uid);
    console.log("Usuário de teste removido.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
