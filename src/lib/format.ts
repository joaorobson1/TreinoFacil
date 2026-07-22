/** Formatadores de exibição (pt-BR). */

export function formatWeight(kg?: number | null): string {
  if (kg == null) return "—";
  return `${Number(kg).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg`;
}

/** Volume acumulado: usa toneladas a partir de 1.000 kg. */
export function formatVolume(kg?: number | null): string {
  const v = Number(kg ?? 0);
  if (v >= 1000) {
    return `${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} t`;
  }
  return `${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} kg`;
}

export function formatDuration(seconds?: number | null): string {
  const s = Math.max(0, Math.round(Number(seconds ?? 0)));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min`;
  return "0min";
}

export function formatNumber(n?: number | null): string {
  return Number(n ?? 0).toLocaleString("pt-BR");
}

/** Delta de peso com sinal (ex.: "-2,3 kg", "+1,0 kg", "0 kg"). */
export function formatWeightDelta(delta: number): string {
  const rounded = Math.round(delta * 10) / 10;
  if (rounded === 0) return "0 kg";
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg`;
}

/** "segunda-feira, 21 de julho" com a primeira letra maiúscula. */
export function formatToday(date = new Date()): string {
  const s = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}
