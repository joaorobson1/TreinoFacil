"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => console.error(error), [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="bg-destructive/10 text-destructive flex size-14 items-center justify-center rounded-2xl">
        <TriangleAlert className="size-6" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Erro ao carregar o painel</h2>
        <p className="text-muted-foreground max-w-xs text-sm">
          Tente novamente.
        </p>
      </div>
      <Button onClick={reset} className="h-11 rounded-2xl font-semibold">
        Tentar de novo
      </Button>
    </div>
  );
}
