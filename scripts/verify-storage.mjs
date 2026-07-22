/**
 * Verifica o bucket de mídia: upload + URL pública acessível + remoção.
 * Uso: `node scripts/verify-storage.mjs`
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// PNG 1x1 transparente
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);
const path = `exercises/verify_${Date.now()}.png`;

const up = await db.storage.from("exercise-media").upload(path, png, { contentType: "image/png" });
console.log("upload:", up.error ? `FALHOU (${up.error.message})` : "OK ✓");

const { data } = db.storage.from("exercise-media").getPublicUrl(path);
const res = await fetch(data.publicUrl);
console.log("URL pública:", res.status === 200 ? "acessível ✓ (200)" : `status ${res.status} ✗`);

await db.storage.from("exercise-media").remove([path]);
console.log("removido:", "OK");

console.log(!up.error && res.status === 200 ? "\n✓ Storage OK." : "\n✗ Falha no storage.");
process.exit(!up.error && res.status === 200 ? 0 : 1);
