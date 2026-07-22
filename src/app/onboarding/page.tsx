import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Vamos começar" };

export default async function OnboardingPage() {
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
  if (profile?.onboarding_completed) redirect(ROUTES.dashboard);

  const [goalsRes, equipRes, limitRes] = await Promise.all([
    supabase
      .from("goals")
      .select("id, name, description")
      .eq("is_active", true)
      .order("sort_order"),
    supabase.from("equipments").select("id, slug, name, category").order("id"),
    supabase
      .from("limitations")
      .select("id, slug, name, category")
      .eq("is_active", true)
      .order("id"),
  ]);

  return (
    <OnboardingWizard
      goals={goalsRes.data ?? []}
      equipments={equipRes.data ?? []}
      limitations={limitRes.data ?? []}
    />
  );
}
