"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { assignWorkoutAction } from "@/actions/workout.actions";

export function GenerateWorkoutButton({
  label = "Gerar meu treino",
  variant = "default",
  className,
}: {
  label?: string;
  variant?: "default" | "ghost" | "outline";
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
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

  return (
    <Button
      onClick={handleClick}
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
}
