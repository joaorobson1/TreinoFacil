/**
 * Cria o bucket público de mídia dos exercícios. Uso: `node scripts/setup-storage.mjs`
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const { error } = await db.storage.createBucket("exercise-media", {
  public: true,
  fileSizeLimit: 52_428_800, // 50 MB
  allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif", "video/mp4", "video/webm"],
});

if (error) {
  if (/already exists/i.test(error.message)) console.log("Bucket 'exercise-media' já existe.");
  else { console.error("✗", error.message); process.exit(1); }
} else {
  console.log("✓ Bucket 'exercise-media' criado (público).");
}
