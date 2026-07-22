/**
 * Enums do domínio — espelham 1:1 os `create type ... as enum` da migration.
 * Fonte única de verdade em TypeScript enquanto os tipos gerados do Supabase
 * (`database.ts`) não são regenerados após aplicar a migration.
 */
export type UserRole = "user" | "admin";
export type Sex = "male" | "female" | "other";
export type ExperienceLevel = "never" | "up_to_6m" | "6m_to_2y" | "over_2y";
export type ExerciseLevel = "beginner" | "intermediate" | "advanced";
export type TrainingLocation = "home" | "condo" | "small_gym" | "full_gym";
export type MediaType = "image" | "gif" | "video";
export type MuscleRole = "primary" | "secondary";
export type WorkoutSource = "algorithm" | "manual" | "admin";
export type RestrictionLevel = "avoid" | "caution";
export type PhotoAngle = "front" | "side" | "back";
export type ProgramStatus = "active" | "completed" | "paused";
export type AdvanceCriteria = "workouts_completed" | "completion_pct" | "time_weeks";
export type AchievementCriteria =
  | "first_workout"
  | "consecutive_days"
  | "total_workouts"
  | "total_volume_kg"
  | "load_progress"
  | "perfect_month"
  | "total_sets"
  | "body_weight_change";
export type OverrideReason = "equipment" | "limitation" | "manual";

// ─────────────────────────────────────────────────────────────
// Regras de mapeamento (ver docs/03-FLUXOS-E-REGRAS.md §4)
// ─────────────────────────────────────────────────────────────

/** Experiência do onboarding (4 níveis) → nível da ficha (3 níveis). */
export function mapExperienceToLevel(exp: ExperienceLevel): ExerciseLevel {
  switch (exp) {
    case "never":
    case "up_to_6m":
      return "beginner";
    case "6m_to_2y":
      return "intermediate";
    case "over_2y":
      return "advanced";
  }
}

/** Capacidade de ambiente, ordenada: home < condo < small_gym < full_gym. */
export const LOCATION_RANK: Record<TrainingLocation, number> = {
  home: 1,
  condo: 2,
  small_gym: 3,
  full_gym: 4,
};

export const LEVEL_RANK: Record<ExerciseLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};
