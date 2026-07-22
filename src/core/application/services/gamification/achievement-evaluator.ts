import type { AchievementCriteria } from "@/core/domain/enums";

/** Sinais agregados para avaliar conquistas (data-driven). */
export type AchievementContext = {
  totalWorkouts: number;
  currentStreak: number;
  totalVolumeKg: number;
  totalSets: number;
  hadLoadProgress: boolean;
  perfectMonth: boolean;
  bodyWeightChange: number;
};

/**
 * AchievementEvaluator — decide se uma conquista foi atingida a partir do
 * `criteria` + `threshold` (cadastrados no banco) e do contexto do usuário.
 * Ver docs/03-FLUXOS-E-REGRAS.md §7.
 */
export function isAchievementUnlocked(
  criteria: AchievementCriteria,
  threshold: number,
  ctx: AchievementContext,
): boolean {
  switch (criteria) {
    case "first_workout":
      return ctx.totalWorkouts >= 1;
    case "total_workouts":
      return ctx.totalWorkouts >= threshold;
    case "consecutive_days":
      return ctx.currentStreak >= threshold;
    case "total_volume_kg":
      return ctx.totalVolumeKg >= threshold;
    case "total_sets":
      return ctx.totalSets >= threshold;
    case "load_progress":
      return ctx.hadLoadProgress;
    case "perfect_month":
      return ctx.perfectMonth;
    case "body_weight_change":
      return Math.abs(ctx.bodyWeightChange) >= threshold;
  }
}
