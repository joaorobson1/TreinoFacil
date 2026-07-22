/**
 * Verifica o CRUD do admin (fichas/dias/exercícios/lookups) sob RLS.
 * Uso: `npx tsx scripts/verify-admin-crud.ts`
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
) as Record<string, string>;

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const admin = createClient<Database>(url, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function makeUser(role: "admin" | "user") {
  const email = `crud_${role}_${Date.now()}@example.com`;
  const { data } = await admin.auth.admin.createUser({ email, password: "test123456", email_confirm: true, user_metadata: { name: role } });
  const uid = data.user!.id;
  if (role === "admin") await admin.from("users").update({ role: "admin" }).eq("id", uid);
  const client = createClient<Database>(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  await client.auth.signInWithPassword({ email, password: "test123456" });
  return { uid, client };
}

async function main() {
  const { data: goal } = await admin.from("goals").select("id").limit(1).single();
  const { data: ex } = await admin.from("exercises").select("id").limit(1).single();

  const a = await makeUser("admin");
  const u = await makeUser("user");
  let templateId: string | null = null;
  const lookupIds: number[] = [];

  try {
    // admin cria ficha → dia → exercício
    const t = await a.client.from("workout_templates").insert({
      name: `CRUD Test ${Date.now()}`, goal_id: goal!.id, experience: "beginner",
      days_per_week: 3, session_duration_minutes: 60, min_location: "full_gym", is_active: false,
    }).select("id").single();
    templateId = t.data?.id ?? null;
    console.log("admin cria ficha:", t.error ? `BLOQUEADO (${t.error.message})` : "OK ✓");

    const day = await a.client.from("workout_days").insert({
      template_id: templateId!, day_index: 1, name: "Dia A",
    }).select("id").single();
    console.log("admin cria dia:", day.error ? "BLOQUEADO" : "OK ✓");

    const we = await a.client.from("workout_exercises").insert({
      workout_day_id: day.data!.id, exercise_id: ex!.id, position: 1, sets: 3, reps: "12", rest_seconds: 60,
    }).select("id").single();
    console.log("admin cria exercício do dia:", we.error ? "BLOQUEADO" : "OK ✓");

    // admin cria lookup (equipamento)
    const eq = await a.client.from("equipments").insert({
      slug: `teste_eq_${Date.now()}`, name: "Equipamento Teste",
    }).select("id").single();
    if (eq.data) lookupIds.push(eq.data.id);
    console.log("admin cria equipamento:", eq.error ? "BLOQUEADO" : "OK ✓");

    // usuário comum tenta criar ficha → deve ser bloqueado
    const blocked = await u.client.from("workout_templates").insert({
      name: "Hack", goal_id: goal!.id, experience: "beginner",
      days_per_week: 3, session_duration_minutes: 60, min_location: "home",
    }).select("id").single();
    console.log("usuário comum cria ficha:", blocked.error ? "BLOQUEADO ✓ (RLS)" : "OK ✗ (deveria bloquear!)");

    const ok = !t.error && !day.error && !we.error && !eq.error && !!blocked.error;
    console.log(ok ? "\n✓ CRUD admin OK (RLS)." : "\n✗ Falha no CRUD admin.");
  } finally {
    if (templateId) await admin.from("workout_templates").delete().eq("id", templateId);
    for (const id of lookupIds) await admin.from("equipments").delete().eq("id", id);
    await admin.auth.admin.deleteUser(a.uid);
    await admin.auth.admin.deleteUser(u.uid);
    console.log("Limpeza concluída.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
