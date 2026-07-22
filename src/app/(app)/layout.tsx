import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { AppShell } from "@/components/shared/app-shell";
import { ROUTES } from "@/lib/routes";

/**
 * Casca da área autenticada: garante sessão + onboarding concluído (gating
 * centralizado) e envolve todas as telas com AppShell (navegação inferior).
 */
export default async function AppLayout({
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

  return <AppShell>{children}</AppShell>;
}
