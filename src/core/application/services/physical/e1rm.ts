/**
 * 1RM estimado (fórmula de Epley). Usado para a curva de força por exercício.
 * Séries de peso corporal / sem carga retornam 0.
 */
export function epley1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}
