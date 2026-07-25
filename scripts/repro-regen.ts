/**
 * Reproduz "Gerar novamente": gera a ficha duas vezes e compara.
 * Uso: `npx tsx scripts/repro-regen.ts`
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
  const { data: goal } = await admin.from("goals").select("id, slug").eq("slug", "emagrecer").single();
  const { data: eq } = await admin.from("equipments").select("id").in("slug", SMALL_GYM);
  const { count: candCount } = await admin.from("workout_templates")
    .select("*", { count: "exact", head: true }).eq("goal_id", goal!.id).eq("is_active", true);
  console.log(`templates ativos para o goal: ${candCount}`);

  const { data: created } = await admin.auth.admin.createUser({
    email: `regen_${Date.now()}@example.com`, password: "test123456", email_confirm: true, user_metadata: { name: "Regen Bot" },
  });
  const uid = created!.user!.id;

  try {
    await admin.from("profiles").update({
      sex: "male", age: 28, height_cm: 175, weight_kg: 78, goal_id: goal!.id, experience: "never",
      available_days: 5, available_time_minutes: 60, training_location: "small_gym", onboarding_completed: true,
    }).eq("user_id", uid);
    await admin.from("user_equipments").insert((eq ?? []).map((e) => ({ user_id: uid, equipment_id: e.id })));

    const authed = createClient<Database>(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    await authed.auth.signInWithPassword({ email: created!.user!.email!, password: "test123456" });

    async function snapshot() {
      const { data: uw } = await authed.from("user_workouts")
        .select("id, template_id, workout_templates(name)").eq("user_id", uid).eq("is_active", true).single();
      const wt = uw!.workout_templates as { name: string } | null;
      const { data: ov } = await authed.from("user_workout_overrides")
        .select("substitute_exercise_id").eq("user_workout_id", uw!.id);
      return { uwId: uw!.id, templateId: uw!.template_id, name: wt?.name ?? "?", overrides: (ov ?? []).length };
    }

    const r1 = await assignWorkoutForUser(authed, uid); // 1ª geração (onboarding): melhor encaixe
    const s1 = await snapshot();
    // regenerar evitando a ficha atual (fluxo do "Gerar novamente")
    const r2 = await assignWorkoutForUser(authed, uid, { avoidTemplateId: s1.templateId });
    const s2 = await snapshot();
    // regenerar de novo, evitando a segunda → deve voltar/variar de novo
    const r3 = await assignWorkoutForUser(authed, uid, { avoidTemplateId: s2.templateId });
    const s3 = await snapshot();

    console.log("\ngeração 1 (melhor encaixe):", JSON.stringify({ ok: r1.ok, name: s1.name }));
    console.log("geração 2 (evita a 1):      ", JSON.stringify({ ok: r2.ok, name: s2.name }));
    console.log("geração 3 (evita a 2):      ", JSON.stringify({ ok: r3.ok, name: s3.name }));
    console.log("\ntemplate mudou na 2ª geração?", s1.templateId !== s2.templateId,
      s1.templateId !== s2.templateId ? "✓ agora varia" : "✗ ainda igual");

    // quantos user_workouts ao todo (ativos/inativos)?
    const { count: total } = await admin.from("user_workouts").select("*", { count: "exact", head: true }).eq("user_id", uid);
    const { count: active } = await admin.from("user_workouts").select("*", { count: "exact", head: true }).eq("user_id", uid).eq("is_active", true);
    console.log(`\nuser_workouts: ${total} no total, ${active} ativo(s) (deve ser 1)`);
  } finally {
    await admin.auth.admin.deleteUser(uid);
    console.log("teste removido.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
