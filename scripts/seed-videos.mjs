/**
 * Popula exercise_media (type video) com links do YouTube por exercício (slug).
 * Idempotente: substitui os vídeos existentes de cada exercício.
 * Uso: `node scripts/seed-videos.mjs`
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// slug → URL do YouTube (Shorts/vídeos com duração verificada < 60s)
const VIDEOS = {
  flexao_bracos: "https://www.youtube.com/shorts/PLx6esBKKsU",
  supino_reto_halteres: "https://www.youtube.com/shorts/k1gMi4IZZEA",
  supino_reto_barra: "https://www.youtube.com/shorts/AjTLUlx4nEs",
  supino_maquina: "https://www.youtube.com/shorts/9IhKs2LEWgw",
  crucifixo_crossover: "https://www.youtube.com/shorts/aKLWkfAU55s",
  superman: "https://www.youtube.com/shorts/JDK0qWuxcIY",
  remada_elastico: "https://www.youtube.com/shorts/FtTtLtCPMyU",
  remada_halteres: "https://www.youtube.com/shorts/A6Rjc6aUUB8",
  remada_maquina: "https://www.youtube.com/shorts/XrePiLlEAcU",
  puxada_polia: "https://www.youtube.com/shorts/S9OjmGmgiuo",
  remada_curvada_barra: "https://www.youtube.com/shorts/DNGwvrde5o4",
  flexao_pike: "https://www.youtube.com/shorts/E7jbTXP2MTE",
  elevacao_lateral: "https://www.youtube.com/shorts/Minwy5dftuU",
  desenvolvimento_halteres: "https://www.youtube.com/shorts/fUqCp4WNKeM",
  desenvolvimento_militar_barra: "https://www.youtube.com/shorts/Xy0HBD2K4Jk",
  rosca_elastico: "https://www.youtube.com/shorts/i1_9DbrtAxM",
  rosca_alternada_halteres: "https://www.youtube.com/shorts/1LpnsHK6uMw",
  rosca_direta_barra: "https://www.youtube.com/shorts/T9fJo9zNu0Y",
  rosca_polia: "https://www.youtube.com/shorts/HSw1-OVMurg",
  mergulho_banco: "https://www.youtube.com/shorts/NUfBZ1SEyPU",
  triceps_polia: "https://www.youtube.com/watch?v=M-DTY40JG9M",
  triceps_frances_halter: "https://www.youtube.com/shorts/mfXokM_VnMY",
  agachamento_peso_corporal: "https://www.youtube.com/shorts/etz4vJAVMa4",
  agachamento_livre: "https://www.youtube.com/watch?v=rM6SDUdl9fs",
  leg_press_45: "https://www.youtube.com/watch?v=waAxlYvtCcI",
  cadeira_extensora_ex: "https://www.youtube.com/shorts/McDlS16kwhI",
  afundo_halteres: "https://www.youtube.com/shorts/SgUl1OfUZ7U",
  ponte_gluteo: "https://www.youtube.com/shorts/GpuKb85sNlY",
  stiff_halteres: "https://www.youtube.com/shorts/oXwLyXxYNfY",
  mesa_flexora_ex: "https://www.youtube.com/watch?v=NFtc19X0NYg",
  elevacao_pelvica: "https://www.youtube.com/shorts/78wEGbnpfNA",
  panturrilha_pe: "https://www.youtube.com/watch?v=a1s-U4UQkIg",
  panturrilha_halteres: "https://www.youtube.com/shorts/59HKuN7WRjI",
  prancha: "https://www.youtube.com/shorts/gKKDMSMP__0",
  abdominal_supra: "https://www.youtube.com/shorts/w08qG9nQZ_Q",
  elevacao_pernas: "https://www.youtube.com/watch?v=IIMzCZXqIeA",
  polichinelo: "https://www.youtube.com/shorts/RF9Jj6H160c",
};

const { data: exercises } = await db.from("exercises").select("id, slug");
const idBySlug = Object.fromEntries((exercises ?? []).map((e) => [e.slug, e.id]));

let ok = 0;
let missing = 0;
for (const [slug, url] of Object.entries(VIDEOS)) {
  if (!url) { missing++; continue; }
  const id = idBySlug[slug];
  if (!id) { console.warn(`sem exercício para slug ${slug}`); missing++; continue; }
  await db.from("exercise_media").delete().eq("exercise_id", id).eq("type", "video");
  const { error } = await db.from("exercise_media").insert({
    exercise_id: id, type: "video", url, is_primary: true, position: 0,
  });
  if (error) { console.error(`${slug}: ${error.message}`); missing++; }
  else ok++;
}
console.log(`✓ vídeos: ${ok} inseridos, ${missing} sem link.`);
