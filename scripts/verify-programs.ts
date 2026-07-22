/**
 * Verifica ENROLLMENT + PROGRESSÃO AUTOMÁTICA de programa (sem IA).
 * Cria um programa de 2 fases, matricula um usuário compatível, conclui treinos
 * e confirma o avanço de fase e a conclusão do programa.
 * Uso: `npx tsx scripts/verify-programs.ts`
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { assignWorkoutForUser } from "@/infrastructure/workout/assign-workout";
import { evaluateProgramProgression } from "@/infrastructure/workout/program-progression";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
) as Record<string, string>;

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const admin = createClient<Database>(url, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const SMALL_GYM = ["peso_corporal", "halteres", "barra_olimpica", "leg_press", "maquina_supino", "maquina_remada", "cadeira_extensora", "mesa_flexora", "polias", "banco_reto"];

const P1_THRESHOLD = 2; // treinos p/ sair da fase 1
const P2_THRESHOLD = 3; // treinos p/ concluir a fase 2 (fim do programa)

async function main() {
  const { data: goal } = await admin.from("goals").select("id").eq("slug", "emagrecer").single();
  const { data: eq } = await admin.from("equipments").select("id, slug").in("slug", SMALL_GYM);
  const { data: tpls } = await admin
    .from("workout_templates").select("id, name")
    .eq("goal_id", goal!.id).eq("is_active", true).order("name").limit(2);
  if (!tpls || tpls.length === 0) throw new Error("Sem templates para o goal de teste.");
  const tplA = tpls[0];
  const tplB = tpls[1] ?? tpls[0]; // se só houver 1, reusa (ainda testa avanço de fase)
  console.log(`Fichas: fase1=${tplA.name}  fase2=${tplB.name}`);

  // ---------- cria programa + 2 fases (service role) ----------
  const stamp = Date.now();
  const { data: prog, error: pe } = await admin.from("programs").insert({
    name: `[TEST] Programa ${stamp}`, slug: `test-prog-${stamp}`,
    goal_id: goal!.id, experience: "beginner", is_active: true,
  }).select("id").single();
  if (pe || !prog) throw new Error(pe?.message);

  const { data: phases, error: fe } = await admin.from("program_phases").insert([
    { program_id: prog.id, phase_index: 1, name: "Fase 1 — Adaptação", template_id: tplA.id, advance_criteria: "workouts_completed", advance_threshold: P1_THRESHOLD },
    { program_id: prog.id, phase_index: 2, name: "Fase 2 — Progressão", template_id: tplB.id, advance_criteria: "workouts_completed", advance_threshold: P2_THRESHOLD },
  ]).select("id, phase_index");
  if (fe || !phases) throw new Error(fe?.message);
  const phase1 = phases.find((p) => p.phase_index === 1)!;
  const phase2 = phases.find((p) => p.phase_index === 2)!;

  // ---------- usuário compatível ----------
  const email = `prog_${stamp}@example.com`;
  const { data: created, error } = await admin.auth.admin.createUser({
    email, password: "test123456", email_confirm: true, user_metadata: { name: "Prog Bot" },
  });
  if (error || !created.user) throw new Error(error?.message);
  const uid = created.user.id;

  let pass = true;
  const check = (label: string, cond: boolean) => {
    console.log(`${cond ? "✓" : "✗"} ${label}`);
    if (!cond) pass = false;
  };

  try {
    await admin.from("profiles").update({
      sex: "male", age: 28, height_cm: 175, weight_kg: 78, goal_id: goal!.id,
      experience: "never", available_days: 5, available_time_minutes: 60,
      training_location: "small_gym", onboarding_completed: true,
    }).eq("user_id", uid);
    await admin.from("user_equipments").insert((eq ?? []).map((e) => ({ user_id: uid, equipment_id: e.id })));

    const authed = createClient<Database>(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    await authed.auth.signInWithPassword({ email, password: "test123456" });

    // ---------- 1) ENROLLMENT ----------
    await assignWorkoutForUser(authed, uid);
    const { data: up0 } = await authed.from("user_programs").select("id, program_id, current_phase_id, phase_started_at, status, is_active").eq("user_id", uid).eq("is_active", true).maybeSingle();
    check("matriculou no programa", up0?.program_id === prog.id);
    check("fase inicial = fase 1", up0?.current_phase_id === phase1.id);

    const { data: uw0 } = await authed.from("user_workouts").select("template_id, user_program_id, program_phase_id").eq("user_id", uid).eq("is_active", true).single();
    check("ficha ativa = ficha da fase 1", uw0?.template_id === tplA.id);
    check("ficha vinculada ao programa/fase", uw0?.user_program_id === up0?.id && uw0?.program_phase_id === phase1.id);

    // timestamps estritamente após phase_started_at do enrollment
    const base = Date.parse(up0!.phase_started_at);
    let n = 0;
    async function doWorkout(): Promise<{ advanced: boolean; completed: boolean }> {
      n++;
      const completedAt = new Date(base + n * 60_000).toISOString();
      const { data: uw } = await authed.from("user_workouts").select("id, template_id").eq("user_id", uid).eq("is_active", true).single();
      const { data: day } = await authed.from("workout_days").select("id").eq("template_id", uw!.template_id).order("day_index").limit(1).single();
      const { data: cw } = await authed.from("completed_workouts")
        .insert({ user_id: uid, user_workout_id: uw!.id, workout_day_id: day!.id, completed_at: completedAt, duration_seconds: 1800, total_volume: 100 })
        .select("id, completed_at").single();
      return evaluateProgramProgression(authed, uid, cw!.completed_at);
    }

    // ---------- 2) PROGRESSÃO fase 1 → fase 2 ----------
    const r1 = await doWorkout();
    check(`treino 1: ainda na fase 1 (threshold ${P1_THRESHOLD})`, !r1.advanced && !r1.completed);
    const r2 = await doWorkout();
    check("treino 2: avançou para a fase 2", r2.advanced && !r2.completed);

    const { data: up2 } = await authed.from("user_programs").select("current_phase_id").eq("id", up0!.id).single();
    check("current_phase_id = fase 2", up2?.current_phase_id === phase2.id);
    const { data: uw2 } = await authed.from("user_workouts").select("template_id, program_phase_id").eq("user_id", uid).eq("is_active", true).single();
    check("ficha reatribuída p/ ficha da fase 2", uw2?.template_id === tplB.id && uw2?.program_phase_id === phase2.id);

    // ---------- 3) CONCLUSÃO do programa (fim da fase 2) ----------
    // treino-gatilho (fase2 phase_started_at) NÃO conta; precisamos de P2_THRESHOLD novos
    let final = { advanced: false, completed: false };
    for (let i = 0; i < P2_THRESHOLD; i++) final = await doWorkout();
    check("programa concluído após a última fase", final.completed && !final.advanced);
    const { data: up3 } = await authed.from("user_programs").select("status, is_active").eq("id", up0!.id).single();
    check("user_program status=completed, inativo", up3?.status === "completed" && up3?.is_active === false);

    console.log(pass ? "\n✓ Programas OK (enrollment + progressão + conclusão)." : "\n✗ Falha na verificação de programas.");
  } finally {
    await admin.auth.admin.deleteUser(uid);
    await admin.from("programs").delete().eq("id", prog.id); // cascata remove as fases
    console.log("Usuário e programa de teste removidos.");
  }
  if (!pass) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
