"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SessionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  useEffect(() => console.error(error), [error]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="bg-destructive/10 text-destructive flex size-14 items-center justify-center rounded-2xl">
        <TriangleAlert className="size-6" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Não deu para abrir o treino</h2>
        <p className="text-muted-foreground max-w-xs text-sm text-pretty">
          Tente novamente ou volte para a sua ficha.
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-2 pt-2">
        <Button onClick={reset} className="h-11 rounded-2xl font-semibold">
          Tentar de novo
        </Button>
        <Button variant="ghost" onClick={() => router.push("/workout")} className="h-11 rounded-2xl">
          <ArrowLeft className="size-4" />
          Voltar à ficha
        </Button>
      </div>
    </div>
  );
}
