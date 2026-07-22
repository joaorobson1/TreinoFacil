/**
 * Seed idempotente das tabelas de referência via service role (ignora RLS).
 * Espelha supabase/seed.sql. Uso: `node scripts/seed.mjs`
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
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY em .env.local");

const db = createClient(url, key, { auth: { persistSession: false } });

const goals = [
  { slug: "emagrecer", name: "Emagrecer", description: "Reduzir gordura corporal", icon: "flame", sort_order: 1 },
  { slug: "hipertrofia", name: "Hipertrofia", description: "Ganhar massa muscular", icon: "dumbbell", sort_order: 2 },
  { slug: "definicao", name: "Definição", description: "Definir e tonificar", icon: "sparkles", sort_order: 3 },
  { slug: "condicionamento", name: "Condicionamento", description: "Melhorar o preparo físico", icon: "heart-pulse", sort_order: 4 },
  { slug: "saude", name: "Saúde", description: "Treinar pelo bem-estar", icon: "leaf", sort_order: 5 },
  { slug: "ganho_forca", name: "Ganho de força", description: "Aumentar a força máxima", icon: "dumbbell", sort_order: 6 },
  { slug: "mobilidade", name: "Mobilidade", description: "Ganhar amplitude e mobilidade", icon: "move", sort_order: 7 },
  { slug: "reabilitacao", name: "Reabilitação", description: "Recuperar-se com segurança", icon: "shield", sort_order: 8 },
  { slug: "performance_esportiva", name: "Performance esportiva", description: "Render mais no esporte", icon: "trophy", sort_order: 9 },
];

const limitations = [
  { slug: "nenhuma", name: "Nenhuma", category: "none" },
  { slug: "dor_joelho", name: "Dor no joelho", category: "joint" },
  { slug: "dor_ombro", name: "Dor no ombro", category: "joint" },
  { slug: "hernia_disco", name: "Hérnia de disco", category: "spine" },
  { slug: "hipertensao", name: "Hipertensão", category: "cardio" },
  { slug: "lombar", name: "Problemas lombares", category: "spine" },
];

const equipments = [
  { slug: "peso_corporal", name: "Peso corporal", category: "peso_corporal" },
  { slug: "halteres", name: "Halteres", category: "livre" },
  { slug: "anilhas", name: "Anilhas", category: "livre" },
  { slug: "kettlebell", name: "Kettlebell", category: "livre" },
  { slug: "barra_olimpica", name: "Barra olímpica", category: "barra" },
  { slug: "smith", name: "Smith", category: "maquina" },
  { slug: "leg_press", name: "Leg press", category: "maquina" },
  { slug: "maquina_supino", name: "Máquina de supino", category: "maquina" },
  { slug: "maquina_remada", name: "Máquina de remada", category: "maquina" },
  { slug: "mesa_flexora", name: "Mesa flexora", category: "maquina" },
  { slug: "cadeira_extensora", name: "Cadeira extensora", category: "maquina" },
  { slug: "crossover", name: "Crossover", category: "cabo" },
  { slug: "polias", name: "Polias", category: "cabo" },
  { slug: "banco_reto", name: "Banco reto", category: "acessorio" },
  { slug: "banco_inclinado", name: "Banco inclinado", category: "acessorio" },
  { slug: "elastico", name: "Elástico", category: "acessorio" },
];

const categories = [
  { slug: "forca", name: "Força" },
  { slug: "cardio", name: "Cardio" },
  { slug: "mobilidade", name: "Mobilidade" },
  { slug: "alongamento", name: "Alongamento" },
];

const muscleGroups = [
  { slug: "peito", name: "Peito" },
  { slug: "costas", name: "Costas" },
  { slug: "ombros", name: "Ombros" },
  { slug: "biceps", name: "Bíceps" },
  { slug: "triceps", name: "Tríceps" },
  { slug: "antebraco", name: "Antebraço" },
  { slug: "quadriceps", name: "Quadríceps" },
  { slug: "posterior", name: "Posteriores de coxa" },
  { slug: "gluteos", name: "Glúteos" },
  { slug: "panturrilha", name: "Panturrilha" },
  { slug: "abdomen", name: "Abdômen" },
];

const achievements = [
  { slug: "primeiro_treino", name: "Primeiro treino", description: "Concluiu o primeiro treino", icon: "play", criteria: "first_workout", threshold: 1, sort_order: 1 },
  { slug: "streak_7", name: "7 dias seguidos", description: "Treinou 7 dias consecutivos", icon: "flame", criteria: "consecutive_days", threshold: 7, sort_order: 2 },
  { slug: "streak_30", name: "30 dias seguidos", description: "Treinou 30 dias consecutivos", icon: "flame", criteria: "consecutive_days", threshold: 30, sort_order: 3 },
  { slug: "treinos_100", name: "100 treinos", description: "Concluiu 100 treinos", icon: "medal", criteria: "total_workouts", threshold: 100, sort_order: 4 },
  { slug: "tonelada_1", name: "Primeira tonelada", description: "Movimentou 1.000 kg no total", icon: "weight", criteria: "total_volume_kg", threshold: 1000, sort_order: 5 },
  { slug: "tonelada_10", name: "10 toneladas", description: "Movimentou 10.000 kg no total", icon: "weight", criteria: "total_volume_kg", threshold: 10000, sort_order: 6 },
  { slug: "evolucao_carga", name: "Primeira evolução de carga", description: "Aumentou a carga em um exercício", icon: "trending-up", criteria: "load_progress", threshold: 1, sort_order: 7 },
  { slug: "mes_perfeito", name: "Mês sem faltar", description: "Treinou em todas as semanas do mês", icon: "calendar", criteria: "perfect_month", threshold: 1, sort_order: 8 },
];

async function upsert(table, rows) {
  const { error } = await db.from(table).upsert(rows, { onConflict: "slug" });
  if (error) {
    console.error(`✗ ${table}: ${error.message}`);
    process.exitCode = 1;
  } else {
    console.log(`✓ ${table}: ${rows.length} linha(s)`);
  }
}

await upsert("goals", goals);
await upsert("limitations", limitations);
await upsert("equipments", equipments);
await upsert("exercise_categories", categories);
await upsert("muscle_groups", muscleGroups);
await upsert("achievements", achievements);

console.log("\nSeed concluído.");
