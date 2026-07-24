import type { Media } from "./exercise-media";

export type LoggedSet = { weight: string; reps: string; done: boolean };

export type SessionExercise = {
  id: string;
  workoutExerciseId: string | null;
  exerciseId: string;
  name: string;
  description: string | null;
  execution: string | null;
  breathing: string | null;
  commonMistakes: string | null;
  tips: string | null;
  muscles: { name: string; role: "primary" | "secondary" }[];
  media: Media[];
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  /** melhor carga registrada da última vez neste exercício (kg), se houver */
  lastWeight: number | null;
};
