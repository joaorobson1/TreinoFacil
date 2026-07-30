/**
 * Identidade legal do controlador (LGPD art. 9º). Aparece na Política de
 * Privacidade e nos Termos, e é exigida por Apple (5.1.1) e Google Play para
 * apps que coletam dados de saúde.
 *
 * Os valores vêm de variáveis de ambiente (NEXT_PUBLIC_LEGAL_*), NÃO ficam no
 * código-fonte — assim o CPF/CNPJ do responsável não é commitado no repositório
 * (que é público). Configure-os em `.env.local` (dev) e no painel de deploy
 * (produção). Enquanto não forem preenchidos, os valores caem no marcador
 * "[PREENCHER]" e as páginas legais exibem um aviso em destaque.
 */
const FALLBACK = {
  controller: "[PREENCHER: razão social ou nome completo do responsável]",
  document: "[PREENCHER: CNPJ ou CPF]",
  contactEmail: "[PREENCHER: e-mail de contato para privacidade]",
  lastUpdated: "29 de julho de 2026",
} as const;

export const LEGAL = {
  /** Razão social da empresa ou seu nome completo, se pessoa física. */
  controller: process.env.NEXT_PUBLIC_LEGAL_CONTROLLER || FALLBACK.controller,
  /** CNPJ ou CPF do controlador. */
  document: process.env.NEXT_PUBLIC_LEGAL_DOCUMENT || FALLBACK.document,
  /** E-mail para exercício de direitos do titular (LGPD art. 18). */
  contactEmail: process.env.NEXT_PUBLIC_LEGAL_CONTACT_EMAIL || FALLBACK.contactEmail,
  /** Data da última revisão destes documentos. */
  lastUpdated: process.env.NEXT_PUBLIC_LEGAL_UPDATED || FALLBACK.lastUpdated,
} as const;

export const LEGAL_PENDING = Object.values(LEGAL).some((v) =>
  v.includes("PREENCHER"),
);
