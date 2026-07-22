import { LEVEL_RANK } from "@/core/domain/enums";
import { isCompatible } from "./workout-validator";
import type { ExerciseInfo, UserContext } from "./types";

/**
 * WorkoutGenerator — encontra substituto para um exercício incompatível,
 * mantendo o MESMO grupo muscular e dificuldade ≤ do usuário, compatível com
 * equipamentos e sem contraindicação. Ver docs/03-FLUXOS-E-REGRAS.md §2.
 */
export function findSubstitute(
  target: ExerciseInfo,
  pool: ExerciseInfo[],
  ctx: UserContext,
  used: Set<string>,
): ExerciseInfo | null {
  const candidates = pool.filter(
    (p) =>
      p.id !== target.id &&
      !used.has(p.id) &&
      p.muscleGroupId != null &&
      p.muscleGroupId === target.muscleGroupId &&
      LEVEL_RANK[p.level] <= LEVEL_RANK[ctx.level] &&
      isCompatible(p, ctx),
  );
  if (candidates.length === 0) return null;

  // prefere o nível mais próximo do teto do usuário; desempate estável por nome
  candidates.sort(
    (a, b) =>
      LEVEL_RANK[b.level] - LEVEL_RANK[a.level] || a.name.localeCompare(b.name),
  );
  return candidates[0];
}
