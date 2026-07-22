import type { Database } from "@/types/database";

/** Atalhos para linhas/inserts/updates/enums do schema gerado. */
type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];

export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T];

// Exemplos de uso:
//   type Goal = Tables<"goals">;
//   type NewMeasurement = TablesInsert<"body_measurements">;
