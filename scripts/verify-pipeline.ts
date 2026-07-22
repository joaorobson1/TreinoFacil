/**
 * Verifica o pipeline em vários cenários (sob RLS, caminho real do botão).
 * Uso: `npx tsx scripts/verify-pipeline.ts`
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

const SMALL_GYM = ["peso_corporal", "halteres", "anilhas", "barra_olimpica", "smith",
  "leg_press", "maquina_supino", "maquina_remada", "cadeira_extensora", "mesa_flexora",
  "polias", "banco_reto", "banco_inclinado"];

let goals: Record<string, number> = {};
let equips: Record<string, number> = {};
let lims: Record<string, number> = {};

async function loadMaps() {
  const g = await admin.from("goals").select("id, slug");
  goals = Object.fromEntries((g.data ?? []).map((r) => [r.slug, r.id]));
  const e = await admin.from("equipments").select("id, slug");
  equips = Object.fromEntries((e.data ?? []).map((r) => [r.slug, r.id]));
  const l = await admin.from("limitations").select("id, slug");
  lims = Object.fromEntries((l.data ?? []).map((r) => [r.slug, r.id]));
}

type Scenario = {
  title: string;
  goal: string;
  location: Database["public"]["Enums"]["training_location"];
  days: number;
  minutes: 30 | 45 | 60 | 90;
  equipmentSlugs: string[];
  limitationSlugs: string[];
};

async function run(s: Scenario) {
  const email = `pipe_${Date.now()}_${Math.floor(performance.now())}@example.com`;
  const { data: created, error } = await admin.auth.admin.createUser({
    email, password: "test123456", email_confirm: true,
    user_metadata: { name: "Pipe Bot" },
  });
  if (error || !created.user) throw new Error(error?.message);
  const uid = created.user.id;
  try {
    await admin.from("profiles").update({
      sex: "male", age: 30, height_cm: 178, weight_kg: 82,
      goal_id: goals[s.goal], experience: "never", available_days: s.days,
      available_time_minutes: s.minutes, training_location: s.location,
      onboarding_completed: true,
    }).eq("user_id", uid);
    if (s.equipmentSlugs.length)
      await admin.from("user_equipments").insert(
        s.equipmentSlugs.map((slug) => ({ user_id: uid, equipment_id: equips[slug] })),
      );
    if (s.limitationSlugs.length)
      await admin.from("user_limitations").insert(
        s.limitationSlugs.map((slug) => ({ user_id: uid, limitation_id: lims[slug] })),
      );

    const authed = createClient<Database>(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    await authed.auth.signInWithPassword({ email, password: "test123456" });
    const res = await assignWorkoutForUser(authed, uid);

    const { data: uw } = await admin.from("user_workouts")
      .select("id, workout_templates(name, days_per_week, session_duration_minutes, min_location)")
      .eq("user_id", uid).eq("is_active", true).maybeSingle();
    const { count } = await admin.from("user_workout_overrides")
      .select("*", { count: "exact", head: true }).eq("user_workout_id", uw?.id ?? "");

    const t = uw?.workout_templates;
    console.log(`\n▶ ${s.title}`);
    console.log(`  pedido: ${s.location} · ${s.days} dias · ${s.minutes}min · ${s.goal}`);
    console.log(`  ficha : ${t?.name}`);
    console.log(`  → ${t?.days_per_week} dias · ${t?.session_duration_minutes}min · ${t?.min_location} · ${count} adaptações · ${res.ok ? "ok" : res.error}`);
  } finally {
    await admin.auth.admin.deleteUser(uid);
  }
}

async function main() {
  await loadMaps();
  // 1) Perfil reportado pelo usuário
  await run({ title: "Emagrecer • academia pequena • 5 dias • 60min", goal: "emagrecer",
    location: "small_gym", days: 5, minutes: 60, equipmentSlugs: SMALL_GYM, limitationSlugs: [] });
  // 2) Só peso corporal em casa → deve cair no fallback
  await run({ title: "Emagrecer • casa • 3 dias • 45min • só peso corporal", goal: "emagrecer",
    location: "home", days: 3, minutes: 45, equipmentSlugs: ["peso_corporal"], limitationSlugs: [] });
  // 3) Hipertrofia academia com dor no joelho → 4 dias + substituições
  await run({ title: "Hipertrofia • academia • 4 dias • 60min • dor no joelho", goal: "hipertrofia",
    location: "full_gym", days: 4, minutes: 60,
    equipmentSlugs: [...SMALL_GYM, "crossover", "kettlebell", "elastico"], limitationSlugs: ["dor_joelho"] });
  console.log("\nConcluído.");
}

main().catch((e) => { console.error(e); process.exit(1); });
