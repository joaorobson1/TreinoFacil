/**
 * Smoke test da visão de programa do usuário (getUserProgram): matricula um
 * usuário, conclui 1 treino e confere fase/progresso reportados.
 * Uso: `npx tsx scripts/verify-user-program.ts`
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { assignWorkoutForUser } from "@/infrastructure/workout/assign-workout";
import { getUserProgram } from "@/infrastructure/workout/get-user-program";

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
  const { data: eq } = await admin.from("equipments").select("id").in("slug", SMALL_GYM);
  const { data: tpls } = await admin.from("workout_templates").select("id").eq("goal_id", goal!.id).eq("is_active", true).order("name").limit(2);
  const tplA = tpls![0], tplB = tpls![1] ?? tpls![0];

  const stamp = Date.now();
  const { data: prog } = await admin.from("programs").insert({
    name: `[TEST] View ${stamp}`, slug: `test-view-${stamp}`, goal_id: goal!.id, experience: "beginner", is_active: true,
  }).select("id").single();
  await admin.from("program_phases").insert([
    { program_id: prog!.id, phase_index: 1, name: "Fase 1", template_id: tplA.id, advance_criteria: "workouts_completed", advance_threshold: 3 },
    { program_id: prog!.id, phase_index: 2, name: "Fase 2", template_id: tplB.id, advance_criteria: "workouts_completed", advance_threshold: 4 },
  ]);

  const { data: created } = await admin.auth.admin.createUser({
    email: `view_${stamp}@example.com`, password: "test123456", email_confirm: true, user_metadata: { name: "View Bot" },
  });
  const uid = created!.user!.id;
  let pass = true;
  const check = (l: string, c: boolean) => { console.log(`${c ? "✓" : "✗"} ${l}`); if (!c) pass = false; };

  try {
    await admin.from("profiles").update({
      sex: "male", age: 28, height_cm: 175, weight_kg: 78, goal_id: goal!.id, experience: "never",
      available_days: 5, available_time_minutes: 60, training_location: "small_gym", onboarding_completed: true,
    }).eq("user_id", uid);
    await admin.from("user_equipments").insert((eq ?? []).map((e) => ({ user_id: uid, equipment_id: e.id })));

    const authed = createClient<Database>(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    await authed.auth.signInWithPassword({ email: `view_${stamp}@example.com`, password: "test123456" });
    await assignWorkoutForUser(authed, uid);

    const v0 = await getUserProgram(authed, uid);
    check("retorna a visão do programa", v0?.programName?.includes("[TEST] View") ?? false);
    check("fase atual = 1 de 2", v0?.currentIndex === 1 && v0?.totalPhases === 2);
    check("meta da fase 1 = 3 treinos", v0?.progress.target === 3 && v0?.progress.kind === "workouts");
    check("progresso inicial = 0", v0?.progress.done === 0);
    check("3 fases com status", (v0?.phases.length === 2) && v0?.phases[0].status === "current" && v0?.phases[1].status === "locked");

    // conclui 1 treino → progresso deve subir para 1
    const base = Date.now();
    const { data: uw } = await authed.from("user_workouts").select("id, template_id").eq("user_id", uid).eq("is_active", true).single();
    const { data: day } = await authed.from("workout_days").select("id").eq("template_id", uw!.template_id).order("day_index").limit(1).single();
    await authed.from("completed_workouts").insert({
      user_id: uid, user_workout_id: uw!.id, workout_day_id: day!.id,
      completed_at: new Date(base + 60_000).toISOString(), duration_seconds: 1800, total_volume: 100,
    });
    const v1 = await getUserProgram(authed, uid);
    check("progresso após 1 treino = 1 de 3", v1?.progress.done === 1);

    console.log(pass ? "\n✓ Visão de programa OK." : "\n✗ Falha.");
  } finally {
    await admin.auth.admin.deleteUser(uid);
    await admin.from("programs").delete().eq("id", prog!.id);
    console.log("teste removido.");
  }
  if (!pass) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
