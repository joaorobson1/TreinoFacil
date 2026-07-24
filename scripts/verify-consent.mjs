/**
 * Verifica que o consentimento (LGPD) é persistido em public.users no cadastro
 * e que a idade < 16 é bloqueada pelo check do banco.
 * Uso: `node scripts/verify-consent.mjs`
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

let pass = true;
const check = (label, cond) => { console.log(`${cond ? "✓" : "✗"} ${label}`); if (!cond) pass = false; };

// 1) signup com consentimento nos metadados (mesmo caminho da signUpAction:
// user_metadata → trigger handle_new_user → public.users)
const email = `consent_${Date.now()}@example.com`;
const consentedAt = new Date().toISOString();
const { data: su, error: suErr } = await admin.auth.admin.createUser({
  email, password: "test123456", email_confirm: true,
  user_metadata: { name: "Consent Bot", whatsapp: "11999999999", terms_accepted_at: consentedAt, health_consent_at: consentedAt },
});
if (suErr) throw suErr;
const uid = su.user.id;

try {
  const { data: row } = await admin.from("users").select("terms_accepted_at, health_consent_at").eq("id", uid).single();
  check("terms_accepted_at gravado em public.users", !!row?.terms_accepted_at);
  check("health_consent_at gravado em public.users", !!row?.health_consent_at);

  // 2) idade < 16 é rejeitada pelo banco
  const { error: ageErr } = await admin.from("profiles").update({ age: 12 }).eq("user_id", uid);
  check("idade 12 rejeitada pelo check do banco", !!ageErr && /profiles_age_check|violates check/i.test(ageErr.message));

  // 3) idade 16 é aceita
  const { error: age16 } = await admin.from("profiles").update({ age: 16 }).eq("user_id", uid);
  check("idade 16 aceita", !age16);
} finally {
  await admin.auth.admin.deleteUser(uid);
  console.log("usuário de teste removido.");
}
console.log(pass ? "\n✓ Consentimento + idade mínima OK." : "\n✗ Falha.");
if (!pass) process.exit(1);
