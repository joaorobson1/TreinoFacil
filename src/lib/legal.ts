/**
 * ⚠️ PREENCHA ANTES DE PUBLICAR NAS LOJAS.
 *
 * A LGPD (art. 9º) exige que o titular saiba QUEM controla seus dados e como
 * falar com esse controlador. Apple (5.1.1) e Google Play recusam apps que
 * coletam dados de saúde sem uma política de privacidade válida e acessível.
 *
 * Os valores abaixo são marcadores — substitua pelos dados reais. Enquanto
 * contiverem "PREENCHER", as páginas legais exibem um aviso em destaque.
 */
export const LEGAL = {
  /** Razão social da empresa ou seu nome completo, se pessoa física. */
  controller: "[PREENCHER: razão social ou nome completo do responsável]",
  /** CNPJ ou CPF do controlador. */
  document: "[PREENCHER: CNPJ ou CPF]",
  /** E-mail para exercício de direitos do titular (LGPD art. 18). */
  contactEmail: "[PREENCHER: e-mail de contato para privacidade]",
  /** Data da última revisão destes documentos. */
  lastUpdated: "24 de julho de 2026",
} as const;

export const LEGAL_PENDING = Object.values(LEGAL).some((v) =>
  v.includes("PREENCHER"),
);
