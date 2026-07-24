import "server-only";
import { createClient } from "@/infrastructure/supabase/server";

/**
 * Confirma que quem chama é admin. Server actions são endpoints públicos
 * independentes do guard de layout: sem esta checagem, um usuário comum pode
 * invocá-las direto. A RLS ainda bloqueia a escrita, mas um UPDATE/DELETE que
 * casa 0 linhas NÃO retorna erro — a action responderia "sucesso" sem ter feito
 * nada. Aqui a negativa é explícita.
 */
export async function isCallerAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: me } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return me?.role === "admin";
}
