import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { ROUTES } from "@/lib/routes";

/**
 * Layout imersivo (sem navegação inferior) para a execução do treino.
 * Mantém o gating de sessão + onboarding, mas dá a tela inteira ao usuário.
 */
export default async function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("user_id", user.id)
    .single();
  if (!profile?.onboarding_completed) redirect(ROUTES.onboarding);

  return <>{children}</>;
}
