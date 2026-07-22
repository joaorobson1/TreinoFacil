import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SignOutButton } from "@/components/shared/sign-out-button";
import {
  EXPERIENCE_OPTIONS,
  LOCATION_OPTIONS,
  SEX_OPTIONS,
} from "@/lib/constants";
import { formatWeight } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Perfil" };

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  const [{ data: account }, { data: profile }] = await Promise.all([
    supabase.from("users").select("name, email, whatsapp").eq("id", user.id).single(),
    supabase
      .from("profiles")
      .select(
        "sex, age, height_cm, weight_kg, experience, available_days, available_time_minutes, training_location, goals(name)",
      )
      .eq("user_id", user.id)
      .single(),
  ]);

  const name = account?.name ?? "Atleta";
  const initial = name.charAt(0).toUpperCase();
  const dash = "—";

  return (
    <div className="mx-auto w-full max-w-md px-6 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>
        <ThemeToggle />
      </header>

      <div className="mb-6 flex items-center gap-4">
        <div className="bg-primary/15 text-primary flex size-16 items-center justify-center rounded-2xl text-2xl font-bold">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{name}</p>
          <p className="text-muted-foreground truncate text-sm">{account?.email}</p>
          {account?.whatsapp && (
            <p className="text-muted-foreground truncate text-sm">
              {account.whatsapp}
            </p>
          )}
        </div>
      </div>

      <section className="bg-card mb-4 rounded-2xl border px-5 py-2">
        <p className="text-muted-foreground py-2 text-xs font-medium tracking-wide uppercase">
          Dados pessoais
        </p>
        <InfoRow
          label="Sexo"
          value={SEX_OPTIONS.find((o) => o.value === profile?.sex)?.label ?? dash}
        />
        <InfoRow label="Idade" value={profile?.age ? `${profile.age} anos` : dash} />
        <InfoRow
          label="Altura"
          value={profile?.height_cm ? `${profile.height_cm} cm` : dash}
        />
        <InfoRow label="Peso" value={formatWeight(profile?.weight_kg)} />
      </section>

      <section className="bg-card mb-8 rounded-2xl border px-5 py-2">
        <p className="text-muted-foreground py-2 text-xs font-medium tracking-wide uppercase">
          Preferências de treino
        </p>
        <InfoRow label="Objetivo" value={profile?.goals?.name ?? dash} />
        <InfoRow
          label="Experiência"
          value={
            EXPERIENCE_OPTIONS.find((o) => o.value === profile?.experience)?.label ??
            dash
          }
        />
        <InfoRow
          label="Dias por semana"
          value={profile?.available_days ? `${profile.available_days}` : dash}
        />
        <InfoRow
          label="Tempo por treino"
          value={
            profile?.available_time_minutes
              ? `${profile.available_time_minutes} min`
              : dash
          }
        />
        <InfoRow
          label="Onde treina"
          value={
            LOCATION_OPTIONS.find((o) => o.value === profile?.training_location)
              ?.label ?? dash
          }
        />
      </section>

      <SignOutButton />
    </div>
  );
}
