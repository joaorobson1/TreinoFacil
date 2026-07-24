import { z } from "zod";

const optionalNumber = (min: number, max: number, msg: string) =>
  z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.coerce.number().min(min, msg).max(max, msg).nullable(),
  );

export const measurementSchema = z.object({
  weight_kg: z.coerce.number().min(30, "Peso inválido").max(300, "Peso inválido"),
  waist_cm: optionalNumber(40, 200, "Cintura inválida"),
  body_fat_pct: optionalNumber(3, 70, "% de gordura inválido"),
  notes: z.string().trim().max(300, "Nota muito longa").optional().default(""),
});
export type MeasurementInput = z.infer<typeof measurementSchema>;
