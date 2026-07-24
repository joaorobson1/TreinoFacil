import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import {
  type ProfileInitial,
  ProfileEditForm,
} from "@/components/profile/profile-edit-form";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Editar perfil" };

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  const [
    { data: account },
    { data: profile },
    { data: goals },
    { data: equipments },
    { data: limitations },
    { data: userEquip },
    { data: userLimit },
  ] = await Promise.all([
    supabase.from("users").select("name").eq("id", user.id).single(),
    supabase
      .from("profiles")
      .select(
        "sex, age, height_cm, goal_id, experience, available_days, available_time_minutes, training_location",
      )
      .eq("user_id", user.id)
      .single(),
    supabase.from("goals").select("id, name, description").eq("is_active", true).order("sort_order"),
    supabase.from("equipments").select("id, slug, name, category").order("id"),
    supabase.from("limitations").select("id, slug, name, category").eq("is_active", true).order("id"),
    supabase.from("user_equipments").select("equipment_id").eq("user_id", user.id),
    supabase.from("user_limitations").select("limitation_id").eq("user_id", user.id),
  ]);

  const initial: ProfileInitial = {
    name: account?.name ?? "",
    sex: profile?.sex ?? null,
    age: profile?.age ?? null,
    height_cm: profile?.height_cm ?? null,
    goal_id: profile?.goal_id ?? null,
    experience: profile?.experience ?? null,
    available_days: profile?.available_days ?? null,
    available_time_minutes: profile?.available_time_minutes ?? null,
    training_location: profile?.training_location ?? null,
    equipment_ids: (userEquip ?? []).map((e) => e.equipment_id),
    limitation_ids: (userLimit ?? []).map((l) => l.limitation_id),
  };

  return (
    <div className="mx-auto w-full max-w-md px-6 pt-6 pb-4">
      <header className="mb-6 flex items-center gap-3">
        <Link
          href={ROUTES.profile}
          aria-label="Voltar"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Editar perfil</h1>
      </header>

      <ProfileEditForm
        goals={goals ?? []}
        equipments={equipments ?? []}
        limitations={limitations ?? []}
        initial={initial}
      />
    </div>
  );
}
