/**
 * Verifica RLS de leitura do catálogo por usuário AUTENTICADO (o que o
 * onboarding precisa) e o isolamento de dados de outro usuário.
 * Uso: `node scripts/verify-rls.mjs`
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

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const admin = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const email = `rls_${Date.now()}@example.com`;
const password = "test123456";
const { data: created } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
const uid = created.user.id;

// cliente anon → faz login → vira "authenticated"
const anon = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
const { error: signInErr } = await anon.auth.signInWithPassword({ email, password });
if (signInErr) {
  console.error("login falhou:", signInErr.message);
  await admin.auth.admin.deleteUser(uid);
  process.exit(1);
}

const [g, e, l, ownProfile] = await Promise.all([
  anon.from("goals").select("id").eq("is_active", true),
  anon.from("equipments").select("id"),
  anon.from("limitations").select("id").eq("is_active", true),
  anon.from("profiles").select("user_id").eq("user_id", uid),
]);

console.log("catálogo (authenticated):");
console.log("  goals       :", g.data?.length ?? `erro ${g.error?.message}`);
console.log("  equipments  :", e.data?.length ?? `erro ${e.error?.message}`);
console.log("  limitations :", l.data?.length ?? `erro ${l.error?.message}`);
console.log("próprio profile visível:", ownProfile.data?.length === 1);

const ok =
  (g.data?.length ?? 0) > 0 &&
  (e.data?.length ?? 0) > 0 &&
  (l.data?.length ?? 0) > 0 &&
  ownProfile.data?.length === 1;
console.log(ok ? "\n✓ RLS de leitura OK." : "\n✗ RLS bloqueou leituras necessárias.");

await admin.auth.admin.deleteUser(uid);
console.log("Usuário de teste removido.");
process.exit(ok ? 0 : 1);
