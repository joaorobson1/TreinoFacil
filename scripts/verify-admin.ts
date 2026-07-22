/**
 * Verifica o controle de acesso do admin (RLS) e o analytics.
 * Uso: `npx tsx scripts/verify-admin.ts`
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
) as Record<string, string>;

// disponibiliza para @/lib/env (usado pelo analytics via import dinâmico)
process.env.NEXT_PUBLIC_SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
process.env.SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const admin = createClient<Database>(url, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function makeUser(role: "admin" | "user") {
  const email = `adm_${role}_${Date.now()}@example.com`;
  const { data } = await admin.auth.admin.createUser({ email, password: "test123456", email_confirm: true, user_metadata: { name: `${role} bot` } });
  const uid = data.user!.id;
  if (role === "admin") await admin.from("users").update({ role: "admin" }).eq("id", uid);
  const client = createClient<Database>(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  await client.auth.signInWithPassword({ email, password: "test123456" });
  return { uid, client };
}

async function main() {
  const { data: muscle } = await admin.from("muscle_groups").select("id").limit(1).single();

  const adminUser = await makeUser("admin");
  const normalUser = await makeUser("user");
  const createdIds: string[] = [];

  try {
    const row = (suffix: string) => ({
      name: `Teste ${suffix}`, slug: `teste_${suffix}_${Date.now()}`,
      primary_muscle_group_id: muscle!.id, level: "beginner" as const, is_active: true,
    });

    // admin PODE inserir
    const a = await adminUser.client.from("exercises").insert(row("admin")).select("id").single();
    console.log("admin insere exercício:", a.error ? `BLOQUEADO (${a.error.message})` : "OK ✓");
    if (a.data) createdIds.push(a.data.id);

    // usuário comum NÃO pode inserir
    const n = await normalUser.client.from("exercises").insert(row("user")).select("id").single();
    console.log("usuário comum insere:", n.error ? "BLOQUEADO ✓ (RLS)" : "OK ✗ (deveria bloquear!)");
    if (n.data) createdIds.push(n.data.id);

    // analytics (service role)
    const { getAdminAnalytics } = await import("@/infrastructure/admin/analytics");
    const stats = await getAdminAnalytics();
    console.log(`\nanalytics: ${stats.totalUsers} usuários · ${stats.totalCompleted} treinos · ${stats.active7d} ativos(7d)`);

    const ok = !a.error && !!n.error && stats.totalUsers >= 2;
    console.log(ok ? "\n✓ Admin OK (RLS de escrita + analytics)." : "\n✗ Falha na verificação do admin.");
  } finally {
    for (const id of createdIds) await admin.from("exercises").delete().eq("id", id);
    await admin.auth.admin.deleteUser(adminUser.uid);
    await admin.auth.admin.deleteUser(normalUser.uid);
    console.log("Limpeza concluída.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
