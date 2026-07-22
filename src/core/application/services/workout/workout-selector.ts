import { LEVEL_RANK, LOCATION_RANK } from "@/core/domain/enums";
import type { TemplateCandidate, UserContext } from "./types";

/**
 * WorkoutSelector — localiza a ficha mais adequada ao perfil (sem IA).
 * Filtros rígidos + pontuação determinística. Ver docs/03-FLUXOS-E-REGRAS.md §2.
 */

/**
 * Filtros inegociáveis: nunca exige mais dias/tempo do que o usuário tem.
 * O AMBIENTE não é filtro rígido: uma ficha pensada para um ambiente mais
 * equipado ainda pode ser selecionada e ADAPTADA pelo WorkoutGenerator
 * (trocando os poucos aparelhos que faltam). A viabilidade real é decidida
 * por equipamento, com um teto de adaptação no orquestrador.
 */
export function isEligible(t: TemplateCandidate, ctx: UserContext): boolean {
  return t.daysPerWeek <= ctx.days && t.sessionDuration <= ctx.timeMinutes;
}

export function scoreTemplate(t: TemplateCandidate, ctx: UserContext): number {
  const target = LEVEL_RANK[ctx.level];
  const tRank = LEVEL_RANK[t.experience];

  let score = 0;
  // experiência: match exato vale mais; níveis adjacentes perdem pontos
  score += t.experience === ctx.level ? 100 : 100 - 40 * Math.abs(tRank - target);
  // dias: prefere usar o máximo de dias disponíveis
  score += 40 - 10 * (ctx.days - t.daysPerWeek);
  // tempo: prefere sessão mais próxima do tempo disponível
  score += 30 - 15 * ((ctx.timeMinutes - t.sessionDuration) / 15);
  // ambiente: prefere a ficha pensada para o ambiente MAIS PRÓXIMO do usuário
  // (diferença absoluta — penaliza tanto ficha "grande demais" quanto "pequena demais")
  score += 20 - 10 * Math.abs(LOCATION_RANK[ctx.location] - LOCATION_RANK[t.minLocation]);
  // desempate configurável no admin
  score += t.priority;
  return score;
}

/** Candidatos elegíveis, ordenados do melhor para o pior (com desempates). */
export function rankCandidates(
  candidates: TemplateCandidate[],
  ctx: UserContext,
): { template: TemplateCandidate; score: number }[] {
  return candidates
    .filter((t) => isEligible(t, ctx))
    .map((t) => ({ template: t, score: scoreTemplate(t, ctx) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.template.priority - a.template.priority ||
        b.template.daysPerWeek - a.template.daysPerWeek,
    );
}
