/**
 * Aplica um arquivo SQL no projeto Supabase via Management API (usa o
 * SUPABASE_ACCESS_TOKEN do .env.local). Uso: `node scripts/apply-migration.mjs <arquivo.sql>`
 */
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);

const ref = (env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\./) || [])[1];
const token = env.SUPABASE_ACCESS_TOKEN;
const file = process.argv[2];
if (!ref) throw new Error("Não achei o project ref em NEXT_PUBLIC_SUPABASE_URL");
if (!token) throw new Error("Falta SUPABASE_ACCESS_TOKEN em .env.local");
if (!file) throw new Error("Informe o arquivo SQL: node scripts/apply-migration.mjs <arquivo.sql>");

const sql = readFileSync(file, "utf8");
const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});
const text = await res.text();
if (!res.ok) {
  console.error(`✗ ${res.status}: ${text}`);
  process.exit(1);
}
console.log(`✓ Migration aplicada (${file}).`);
console.log(text.length > 2 ? text : "(sem retorno)");
