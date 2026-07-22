/**
 * Limpa fichas e atribuições para que o seed as recrie do zero (usar quando o
 * CONTEÚDO das fichas muda, já que o seed é get-or-create por nome).
 * Cascade: user_workouts → overrides/completed_workouts/user_progress.
 * ATENÇÃO: apaga as fichas atribuídas e o histórico de treinos (dev).
 * Uso: `node scripts/reset-templates.mjs`
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

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

// filtro que casa todas as linhas (delete exige um filtro)
const ALL = (q, col) => q.not(col, "is", null);

const uw = await ALL(db.from("user_workouts").delete(), "id");
if (uw.error) throw new Error("user_workouts: " + uw.error.message);
console.log("✓ user_workouts limpos (cascade: overrides, completed_workouts, user_progress)");

const wt = await ALL(db.from("workout_templates").delete(), "id");
if (wt.error) throw new Error("workout_templates: " + wt.error.message);
console.log("✓ workout_templates limpos (cascade: workout_days, workout_exercises)");

console.log("Reset concluído. Rode `node scripts/seed-workouts.mjs` para recriar.");
