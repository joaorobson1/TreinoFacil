/**
 * Testa escalação de privilégio: um usuário comum consegue se tornar admin
 * alterando a própria coluna `role`? Também testa leitura de dados de terceiros.
 * Uso: `node scripts/verify-privesc.mjs`
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const admin = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const email = `privesc_${Date.now()}@example.com`;
const pass = "test123456";
const { data: created, error } = await admin.auth.admin.createUser({
  email, password: pass, email_confirm: true, user_metadata: { name: "Privesc Bot" },
});
if (error) throw error;
const uid = created.user.id;

try {
  const authed = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  await authed.auth.signInWithPassword({ email, password: pass });

  // 1) tenta virar admin
  const { error: upErr } = await authed.from("users").update({ role: "admin" }).eq("id", uid);
  const { data: after } = await admin.from("users").select("role").eq("id", uid).single();
  const escalated = after?.role === "admin";
  console.log(`1) auto-promoção a admin: ${escalated ? "*** CONSEGUIU (VULNERÁVEL) ***" : "bloqueado (OK)"}`);
  if (upErr) console.log(`   erro retornado: ${upErr.message}`);

  // 2) com o role obtido, consegue ler dados de OUTROS usuários? (is_admin() vira true)
  const { data: others, error: readErr } = await authed.from("users").select("id, email").limit(5);
  console.log(`2) leitura da tabela users: ${others?.length ?? 0} linha(s)${readErr ? ` (erro: ${readErr.message})` : ""}`);
  if ((others?.length ?? 0) > 1) console.log("   *** consegue enxergar outros usuários ***");

  // 3) escrita no catálogo global (protegido por is_admin()).
  // Usa um exercício REAL e confere o valor depois: um update que casa 0 linhas
  // não retorna erro sob RLS e daria falso positivo.
  const { data: ex } = await admin.from("exercises").select("id, name").limit(1).single();
  const { error: catErr } = await authed.from("exercises")
    .update({ name: "PWNED" }).eq("id", ex.id);
  const { data: exAfter } = await admin.from("exercises").select("name").eq("id", ex.id).single();
  const written = exAfter?.name === "PWNED";
  console.log(
    `3) escrita no catálogo: ${written ? "*** GRAVOU (VULNERÁVEL) ***" : "bloqueada (valor intacto)"}`
    + `${catErr ? ` [erro: ${catErr.code ?? catErr.message}]` : " [sem erro retornado]"}`,
  );
  if (written) await admin.from("exercises").update({ name: ex.name }).eq("id", ex.id);

  // 4) tenta inserir no catálogo (INSERT falha alto sob RLS, diferente do UPDATE)
  const { error: insErr } = await authed.from("exercises")
    .insert({ slug: `pwn-${Date.now()}`, name: "PWNED", level: "beginner" });
  console.log(`4) insert no catálogo: ${insErr ? `bloqueado (${insErr.code})` : "*** PERMITIDO ***"}`);

  // 5) dados de saúde de terceiros
  const { data: profs } = await authed.from("profiles").select("user_id, weight_kg, age").limit(5);
  console.log(`5) perfis de saúde visíveis: ${profs?.length ?? 0} (esperado 1 = só o próprio)`);
  if ((profs?.length ?? 0) > 1) console.log("   *** VAZAMENTO de dados de saúde de terceiros ***");
} finally {
  await admin.auth.admin.deleteUser(uid);
  console.log("usuário de teste removido.");
}
