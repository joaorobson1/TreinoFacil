import type {
  ExperienceLevel,
  Sex,
  TrainingLocation,
} from "@/core/domain/enums";

/**
 * Opções de UI para os passos do onboarding com enum fixo.
 * (Objetivos, limitações e equipamentos vêm do banco — data-driven.)
 */

export const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Feminino" },
  { value: "other", label: "Outro" },
];

export const EXPERIENCE_OPTIONS: {
  value: ExperienceLevel;
  label: string;
  hint: string;
}[] = [
  { value: "never", label: "Nunca treinou", hint: "Estou começando agora" },
  { value: "up_to_6m", label: "Até 6 meses", hint: "Ainda aprendendo os básicos" },
  { value: "6m_to_2y", label: "6 meses a 2 anos", hint: "Já tenho constância" },
  { value: "over_2y", label: "Mais de 2 anos", hint: "Treino avançado" },
];

export const DAYS_OPTIONS = [2, 3, 4, 5, 6] as const;

export const TIME_OPTIONS = [30, 45, 60, 90] as const;

export const LOCATION_OPTIONS: {
  value: TrainingLocation;
  label: string;
  hint: string;
}[] = [
  { value: "full_gym", label: "Academia completa", hint: "Máquinas e pesos livres" },
  { value: "small_gym", label: "Academia pequena", hint: "Equipamentos limitados" },
  { value: "condo", label: "Condomínio", hint: "Sala de treino básica" },
  { value: "home", label: "Casa", hint: "Pouco ou nenhum equipamento" },
];

/** Opções de descanso configuráveis no cronômetro (segundos). */
export const REST_OPTIONS = [60, 90, 120] as const;

/**
 * Preset de equipamentos (slugs) por ambiente — pré-seleciona a etapa de
 * equipamentos do onboarding conforme "onde treina". `peso_corporal` está
 * sempre presente (garante exercícios de fallback).
 */
export const LOCATION_EQUIPMENT_PRESET: Record<TrainingLocation, string[]> = {
  full_gym: [
    "peso_corporal", "halteres", "anilhas", "kettlebell", "barra_olimpica",
    "smith", "leg_press", "maquina_supino", "maquina_remada", "mesa_flexora",
    "cadeira_extensora", "crossover", "polias", "banco_reto", "banco_inclinado",
    "elastico",
  ],
  small_gym: [
    "peso_corporal", "halteres", "anilhas", "barra_olimpica", "smith",
    "leg_press", "maquina_supino", "maquina_remada", "cadeira_extensora",
    "mesa_flexora", "polias", "banco_reto", "banco_inclinado",
  ],
  condo: ["peso_corporal", "halteres", "elastico", "banco_reto", "kettlebell"],
  home: ["peso_corporal", "elastico", "halteres"],
};

