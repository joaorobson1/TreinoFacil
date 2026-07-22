import type { ExerciseInfo, UserContext, ValidationStatus } from "./types";

/**
 * WorkoutValidator — valida um exercício contra o contexto do usuário:
 * equipamentos disponíveis e limitações físicas. Ver docs/03-FLUXOS-E-REGRAS.md §2.
 */
export function validateExercise(
  ex: ExerciseInfo,
  ctx: UserContext,
): ValidationStatus {
  const missingEquipment = ex.requiredEquipmentIds.some(
    (id) => !ctx.equipmentIds.has(id),
  );
  if (missingEquipment) return "equipment";

  const contraindicated = ex.avoidLimitationIds.some((id) =>
    ctx.limitationIds.has(id),
  );
  if (contraindicated) return "limitation";

  return "ok";
}

/** Um exercício é executável pelo usuário? (equipamento + limitação) */
export function isCompatible(ex: ExerciseInfo, ctx: UserContext): boolean {
  return validateExercise(ex, ctx) === "ok";
}
