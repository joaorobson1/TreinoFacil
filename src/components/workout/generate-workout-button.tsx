"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { cn } from "@/lib/utils";
import { assignWorkoutAction } from "@/actions/workout.actions";

export function GenerateWorkoutButton({
  label = "Gerar meu treino",
  variant = "default",
  className,
  confirm = false,
}: {
  label?: string;
  variant?: "default" | "ghost" | "outline";
  className?: string;
  /** Pede confirmação antes de gerar — usado ao regenerar (apaga a ficha atual). */
  confirm?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    const result = await assignWorkoutAction();
    if (!result.ok) {
      setLoading(false);
      toast.error(result.error);
      return;
    }
    toast.success("Sua ficha foi gerada!");
    router.refresh();
    setLoading(false);
  }

  const button = (
    <Button
      onClick={confirm ? undefined : run}
      disabled={loading}
      variant={variant}
      className={cn("h-12 rounded-2xl text-base font-semibold", className)}
    >
      {loading ? (
        <Loader2 className="size-5 animate-spin" />
      ) : (
        <>
          <Sparkles className="size-5" />
          {label}
        </>
      )}
    </Button>
  );

  if (!confirm) return button;

  return (
    <ConfirmDialog
      title="Gerar uma nova ficha?"
      description="Isto substitui a sua ficha atual e as personalizações (exercícios trocados ou adicionados). Se você estiver em um programa, o progresso de fase também é reiniciado."
      confirmLabel="Gerar nova ficha"
      destructive={false}
      onConfirm={run}
      trigger={button}
    />
  );
}
