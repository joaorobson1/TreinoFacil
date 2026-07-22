import { z } from "zod";

const loggedSetSchema = z.object({
  weight: z.number().nonnegative().nullable(),
  reps: z.number().int().nonnegative().nullable(),
});

export const completeWorkoutSchema = z.object({
  userWorkoutId: z.string().uuid(),
  workoutDayId: z.string().uuid(),
  durationSeconds: z.number().int().nonnegative().max(60 * 60 * 12),
  entries: z
    .array(
      z.object({
        exerciseId: z.string().uuid(),
        workoutExerciseId: z.string().uuid().nullable(),
        sets: z.array(loggedSetSchema),
      }),
    )
    .min(1),
});

export type CompleteWorkoutInput = z.infer<typeof completeWorkoutSchema>;
