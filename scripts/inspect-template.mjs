/** Imprime os dias/exercícios de uma ficha (por trecho do nome). Uso: node scripts/inspect-template.mjs "Emagrecer • Iniciante • 5" */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const term = process.argv[2] ?? "Emagrecer • Iniciante • 5";
const { data } = await db
  .from("workout_templates")
  .select("name, workout_days(day_index, name, focus, workout_exercises(position, sets, reps, exercises(name, muscle_groups:primary_muscle_group_id(name))))")
  .ilike("name", `%${term}%`)
  .limit(1)
  .single();

console.log(`\n${data.name}\n`);
for (const day of data.workout_days.sort((a, b) => a.day_index - b.day_index)) {
  console.log(`▶ ${day.name}  [${day.focus}]`);
  for (const we of day.workout_exercises.sort((a, b) => a.position - b.position)) {
    console.log(`   ${we.sets}×${we.reps.padEnd(6)} ${we.exercises.name}  (${we.exercises.muscle_groups?.name})`);
  }
  console.log();
}
