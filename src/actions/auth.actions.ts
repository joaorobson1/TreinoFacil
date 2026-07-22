"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { type Result, ok, err } from "@/core/shared/result";
import { ROUTES } from "@/lib/routes";
import {
  type SignInInput,
  type SignUpInput,
  signInSchema,
  signUpSchema,
} from "@/lib/validations/auth";

/** Traduz mensagens de erro do Supabase Auth para PT-BR. */
function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Este e-mail já está cadastrado.";
  if (m.includes("email not confirmed"))
    return "Confirme seu e-mail antes de entrar.";
  if (m.includes("password")) return "Senha inválida (mínimo de 6 caracteres).";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Muitas tentativas. Tente novamente em instantes.";
  return "Não foi possível completar. Tente novamente.";
}

export async function signUpAction(
  input: SignUpInput,
): Promise<Result<{ needsConfirmation: boolean }>> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }
  const { name, email, whatsapp, password } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, whatsapp } },
  });

  if (error) return err(mapAuthError(error.message));

  // Sem sessão ⇒ o projeto exige confirmação de e-mail.
  return ok({ needsConfirmation: data.session === null });
}

export async function signInAction(
  input: SignInInput,
): Promise<Result<{ redirectTo: string }>> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }
  const { email, password } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return err(mapAuthError(error.message));

  // Decide destino: onboarding pendente vs dashboard.
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("user_id", data.user.id)
    .single();

  return ok({
    redirectTo: profile?.onboarding_completed ? ROUTES.dashboard : ROUTES.onboarding,
  });
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
