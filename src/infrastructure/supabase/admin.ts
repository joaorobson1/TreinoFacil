import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { SUPABASE_URL } from "@/lib/env";

/**
 * Cliente com SERVICE ROLE — ignora RLS. Uso EXCLUSIVO em server actions/rotinas
 * administrativas confiáveis (ex.: agregações de analytics, seeds). Nunca importe
 * este módulo em código que possa ir para o bundle do cliente.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return createSupabaseClient<Database>(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
