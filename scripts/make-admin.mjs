/**
 * Promove um usuário a admin (por e-mail). Lista os usuários se nenhum e-mail for dado.
 * Uso: `node scripts/make-admin.mjs email@exemplo.com`
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const email = process.argv[2];
const { data: users } = await db.from("users").select("email, role, name").order("created_at");

if (!email) {
  console.log("Usuários:");
  for (const u of users ?? []) console.log(`  ${u.role.padEnd(5)} ${u.email} (${u.name})`);
  console.log("\nInforme um e-mail: node scripts/make-admin.mjs email@exemplo.com");
  process.exit(0);
}

const { data, error } = await db.from("users").update({ role: "admin" }).eq("email", email).select("email, role");
if (error) throw new Error(error.message);
if (!data?.length) console.log(`Nenhum usuário com e-mail ${email}.`);
else console.log(`✓ ${data[0].email} agora é ${data[0].role}.`);
