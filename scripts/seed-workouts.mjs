/**
 * Seed de exercícios + fichas (FASE 5a). Idempotente.
 * Uso: `node scripts/seed-workouts.mjs`
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import {
  EXERCISES,
  CONTRAINDICATIONS,
  FALLBACK_DAYS,
  RICH_TEMPLATES,
  buildGeneratedTemplates,
} from "./data/workouts.mjs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const mapBySlug = async (table) => {
  const { data, error } = await db.from(table).select("id, slug, name");
  if (error) throw new Error(`${table}: ${error.message}`);
  return Object.fromEntries(data.map((r) => [r.slug, r]));
};

const muscles = await mapBySlug("muscle_groups");
const equips = await mapBySlug("equipments");
const limits = await mapBySlug("limitations");
const cats = await mapBySlug("exercise_categories");
const goals = await mapBySlug("goals");

// contraindicações por exercício
const contraByExercise = {};
for (const [restriction, groups] of [
  ["avoid", CONTRAINDICATIONS.avoid],
  ["caution", CONTRAINDICATIONS.caution],
]) {
  for (const [limSlug, exSlugs] of Object.entries(groups)) {
    for (const exSlug of exSlugs) {
      (contraByExercise[exSlug] ??= []).push({
        limitation_id: limits[limSlug].id,
        restriction,
      });
    }
  }
}

// ---------------- EXERCÍCIOS ----------------
const exIdBySlug = {};
for (const ex of EXERCISES) {
  const { data, error } = await db
    .from("exercises")
    .upsert(
      {
        slug: ex.slug,
        name: ex.name,
        description: ex.description,
        category_id: cats[ex.category]?.id ?? null,
        primary_muscle_group_id: muscles[ex.muscle].id,
        equipment_id: equips[ex.equipments[0]]?.id ?? null,
        level: ex.level,
        execution: ex.execution,
        breathing: ex.breathing,
        common_mistakes: ex.common_mistakes,
        tips: ex.tips,
        is_active: true,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (error) throw new Error(`exercise ${ex.slug}: ${error.message}`);
  const id = data.id;
  exIdBySlug[ex.slug] = id;

  // associações (delete + insert → idempotente)
  await db.from("exercise_equipments").delete().eq("exercise_id", id);
  await db.from("exercise_equipments").insert(
    ex.equipments.map((slug) => ({
      exercise_id: id,
      equipment_id: equips[slug].id,
      is_required: true,
    })),
  );

  await db.from("exercise_muscle_groups").delete().eq("exercise_id", id);
  await db.from("exercise_muscle_groups").insert([
    { exercise_id: id, muscle_group_id: muscles[ex.muscle].id, role: "primary" },
    ...ex.secondary.map((slug) => ({
      exercise_id: id,
      muscle_group_id: muscles[slug].id,
      role: "secondary",
    })),
  ]);

  await db.from("exercise_limitations").delete().eq("exercise_id", id);
  const contras = contraByExercise[ex.slug];
  if (contras?.length) {
    await db.from("exercise_limitations").insert(
      contras.map((c) => ({ exercise_id: id, ...c })),
    );
  }
}
console.log(`✓ exercícios: ${EXERCISES.length}`);

// ---------------- FICHAS ----------------
async function createTemplate(tpl) {
  const { data: existing } = await db
    .from("workout_templates")
    .select("id")
    .eq("name", tpl.name)
    .maybeSingle();
  if (existing) return "exists";

  const { data: created, error } = await db
    .from("workout_templates")
    .insert({
      name: tpl.name,
      goal_id: goals[tpl.goal].id,
      experience: tpl.experience,
      days_per_week: tpl.days_per_week,
      session_duration_minutes: tpl.session,
      min_location: tpl.min_location,
      split_type: tpl.split,
      priority: tpl.priority,
      is_active: true,
    })
    .select("id")
    .single();
  if (error) throw new Error(`template ${tpl.name}: ${error.message}`);

  for (let i = 0; i < tpl.days.length; i++) {
    const day = tpl.days[i];
    const { data: dayRow, error: dayErr } = await db
      .from("workout_days")
      .insert({
        template_id: created.id,
        day_index: i + 1,
        name: day.name,
        focus: day.focus,
      })
      .select("id")
      .single();
    if (dayErr) throw new Error(`day ${day.name}: ${dayErr.message}`);

    await db.from("workout_exercises").insert(
      day.exercises.map((e, j) => ({
        workout_day_id: dayRow.id,
        exercise_id: exIdBySlug[e.slug],
        position: j + 1,
        sets: e.sets,
        reps: e.reps,
        rest_seconds: e.rest,
      })),
    );
  }
  return "created";
}

// fallback por objetivo (garante a invariante de cobertura)
const goalSlugs = [
  "emagrecer", "hipertrofia", "definicao", "condicionamento", "saude",
  "ganho_forca", "mobilidade", "reabilitacao", "performance_esportiva",
];
let created = 0;
let skipped = 0;
for (const gslug of goalSlugs) {
  const res = await createTemplate({
    name: `${goals[gslug].name} • Iniciante • 3 dias (em casa)`,
    goal: gslug, experience: "beginner", days_per_week: 3, session: 45,
    min_location: "home", split: "full_body", priority: 0, days: FALLBACK_DAYS,
  });
  if (res === "created") created++;
  else skipped++;
}
for (const tpl of RICH_TEMPLATES) {
  const res = await createTemplate(tpl);
  if (res === "created") created++;
  else skipped++;
}
// fichas geradas (objetivo × split) para cobrir 4/5/6 dias e academia pequena
const goalNameBySlug = Object.fromEntries(
  Object.entries(goals).map(([slug, g]) => [slug, g.name]),
);
for (const tpl of buildGeneratedTemplates(goalNameBySlug)) {
  const res = await createTemplate(tpl);
  if (res === "created") created++;
  else skipped++;
}
console.log(`✓ fichas: ${created} criadas, ${skipped} já existentes`);
console.log("Seed de treinos concluído.");
