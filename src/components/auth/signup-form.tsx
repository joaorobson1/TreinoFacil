"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/routes";
import { signUpAction } from "@/actions/auth.actions";
import { type SignUpInput, signUpSchema } from "@/lib/validations/auth";

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", whatsapp: "", password: "" },
  });

  async function onSubmit(values: SignUpInput) {
    const result = await signUpAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    if (result.value.needsConfirmation) {
      setSentEmail(values.email);
      return;
    }
    router.push(ROUTES.onboarding);
    router.refresh();
  }

  if (sentEmail) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-2xl">
          <MailCheck className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Confirme seu e-mail</h1>
          <p className="text-muted-foreground">
            Enviamos um link de confirmação para{" "}
            <span className="text-foreground font-medium">{sentEmail}</span>. Abra o
            e-mail para ativar sua conta e depois faça login.
          </p>
        </div>
        <Button
          onClick={() => router.push(ROUTES.login)}
          className="h-12 w-full rounded-xl text-base font-semibold"
        >
          Ir para o login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Criar conta</h1>
        <p className="text-muted-foreground">
          Comece a treinar com um plano feito para você.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Seu nome"
            className="h-12 rounded-xl"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-destructive text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@email.com"
            className="h-12 rounded-xl"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-destructive text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(11) 99999-9999"
            className="h-12 rounded-xl"
            {...register("whatsapp")}
          />
          {errors.whatsapp && (
            <p className="text-destructive text-sm">{errors.whatsapp.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mínimo de 6 caracteres"
              className="h-12 rounded-xl pr-11"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-11 items-center justify-center"
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-destructive text-sm">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-12 rounded-xl text-base font-semibold"
        >
          {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : "Criar conta"}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        Já tem conta?{" "}
        <Link href={ROUTES.login} className="text-primary font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
