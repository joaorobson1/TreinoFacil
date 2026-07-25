/**
 * Acesso centralizado às variáveis de ambiente públicas do Supabase.
 * A service-role NÃO é exposta aqui — é lida apenas em `infrastructure/supabase/admin.ts`
 * (server-side) para nunca vazar no bundle do cliente.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Chave pública VAPID (Web Push). Vazia enquanto os lembretes não são configurados. */
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

/**
 * `true` somente quando há credenciais reais. Usado para desligar as chamadas de
 * auth enquanto o projeto Supabase não está conectado (placeholders em `.env.local`),
 * mantendo o app rodável em desenvolvimento.
 */
export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 &&
  !SUPABASE_URL.includes("placeholder") &&
  SUPABASE_ANON_KEY.length > 0 &&
  !SUPABASE_ANON_KEY.includes("placeholder");
