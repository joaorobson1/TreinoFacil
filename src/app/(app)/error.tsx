"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Fronteira de erro da área autenticada: evita a tela branca e oferece recuperação. */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log no cliente para diagnóstico (não expõe detalhes ao usuário).
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70dvh] w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="bg-destructive/10 text-destructive flex size-14 items-center justify-center rounded-2xl">
        <TriangleAlert className="size-6" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Algo deu errado</h2>
        <p className="text-muted-foreground max-w-xs text-sm text-pretty">
          Não conseguimos carregar esta tela. Tente novamente — se persistir,
          feche e abra o app.
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-2 pt-2">
        <Button onClick={reset} className="h-11 rounded-2xl font-semibold">
          <RotateCw className="size-4" />
          Tentar de novo
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="h-11 rounded-2xl"
        >
          Voltar ao início
        </Button>
      </div>
    </div>
  );
}
