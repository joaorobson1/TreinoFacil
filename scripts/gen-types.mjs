/**
 * Regenera src/types/database.ts a partir do schema remoto.
 * Lê ref do projeto e o access token de .env.local. Uso: `npm run db:types`
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const ref = (env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\./) || [])[1];
const token = env.SUPABASE_ACCESS_TOKEN;
if (!ref) throw new Error("Nao consegui extrair o project ref de NEXT_PUBLIC_SUPABASE_URL");
if (!token) throw new Error("Falta SUPABASE_ACCESS_TOKEN em .env.local");

const out = execSync(
  `npx --yes supabase@latest gen types typescript --project-id ${ref} --schema public`,
  { encoding: "utf8", maxBuffer: 20 * 1024 * 1024, env: { ...process.env, SUPABASE_ACCESS_TOKEN: token } },
);

writeFileSync(new URL("../src/types/database.ts", import.meta.url), out);
console.log(`✓ src/types/database.ts atualizado (${out.length} chars)`);
