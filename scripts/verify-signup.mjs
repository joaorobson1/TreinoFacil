/**
 * Verifica o trigger on_auth_user_created: cria um usuário de teste via admin API
 * e confere se users/profiles/user_stats foram criados. Depois remove o usuário.
 * Uso: `node scripts/verify-signup.mjs`
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

const db = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const email = `verify_${Date.now()}@example.com`;
const { data: created, error } = await db.auth.admin.createUser({
  email,
  password: "test123456",
  email_confirm: true,
  user_metadata: { name: "Verify Bot", whatsapp: "11999999999" },
});
if (error) {
  console.error("createUser falhou:", error.message);
  process.exit(1);
}
const uid = created.user.id;
console.log("Usuário auth criado:", uid);

const [u, p, s] = await Promise.all([
  db.from("users").select("name, email, whatsapp, role").eq("id", uid).single(),
  db.from("profiles").select("onboarding_completed").eq("user_id", uid).single(),
  db.from("user_stats").select("total_workouts").eq("user_id", uid).single(),
]);

console.log("users     :", u.data ?? u.error?.message);
console.log("profiles  :", p.data ?? p.error?.message);
console.log("user_stats:", s.data ?? s.error?.message);

const okAll = u.data && p.data && s.data;
console.log(okAll ? "\n✓ Trigger OK — 3 linhas criadas." : "\n✗ Trigger FALHOU.");

await db.auth.admin.deleteUser(uid);
console.log("Usuário de teste removido.");
process.exit(okAll ? 0 : 1);
