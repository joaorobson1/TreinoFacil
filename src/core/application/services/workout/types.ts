import type {
  ExerciseLevel,
  OverrideReason,
  TrainingLocation,
} from "@/core/domain/enums";

/** Contexto do usuário para o pipeline de atribuição. */
export type UserContext = {
  goalId: number;
  level: ExerciseLevel;
  days: number;
  timeMinutes: number;
  location: TrainingLocation;
  equipmentIds: Set<number>;
  limitationIds: Set<number>;
};

export type TemplateCandidate = {
  id: string;
  experience: ExerciseLevel;
  daysPerWeek: number;
  sessionDuration: number;
  minLocation: TrainingLocation;
  priority: number;
};

export type ExerciseInfo = {
  id: string;
  slug: string;
  name: string;
  muscleGroupId: number | null;
  level: ExerciseLevel;
  requiredEquipmentIds: number[];
  avoidLimitationIds: number[];
};

/** Um exercício dentro de um dia da ficha (referência ao workout_exercise). */
export type TemplateExercise = {
  workoutExerciseId: string;
  exercise: ExerciseInfo;
};

export type ValidationStatus = "ok" | "equipment" | "limitation";

/** Substituição produzida pelo Generator (substitute nulo = exercício removido). */
export type WorkoutOverride = {
  workoutExerciseId: string;
  substituteExerciseId: string | null;
  reason: OverrideReason;
};
