export type LookupField = { key: string; label: string };

export type LookupConfig = {
  table: LookupTable;
  label: string;
  singular: string;
  fields: LookupField[];
};

export type LookupTable =
  | "equipments"
  | "muscle_groups"
  | "limitations"
  | "exercise_categories"
  | "goals";

/** Tabelas de referência editáveis pelo admin (whitelist). */
export const LOOKUPS: Record<LookupTable, LookupConfig> = {
  goals: {
    table: "goals",
    label: "Objetivos",
    singular: "objetivo",
    fields: [
      { key: "name", label: "Nome" },
      { key: "description", label: "Descrição" },
      { key: "icon", label: "Ícone (lucide)" },
    ],
  },
  muscle_groups: {
    table: "muscle_groups",
    label: "Grupos musculares",
    singular: "grupo muscular",
    fields: [{ key: "name", label: "Nome" }],
  },
  equipments: {
    table: "equipments",
    label: "Equipamentos",
    singular: "equipamento",
    fields: [
      { key: "name", label: "Nome" },
      { key: "category", label: "Categoria" },
    ],
  },
  limitations: {
    table: "limitations",
    label: "Limitações",
    singular: "limitação",
    fields: [
      { key: "name", label: "Nome" },
      { key: "category", label: "Categoria" },
    ],
  },
  exercise_categories: {
    table: "exercise_categories",
    label: "Categorias de exercício",
    singular: "categoria",
    fields: [{ key: "name", label: "Nome" }],
  },
};

export const LOOKUP_ORDER: LookupTable[] = [
  "goals",
  "muscle_groups",
  "equipments",
  "limitations",
  "exercise_categories",
];
