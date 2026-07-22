import { cn } from "@/lib/utils";

/** Marca do TreinoFácil — wordmark com o "ponto" no accent da marca. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-heading text-2xl font-bold tracking-tight lowercase",
        className,
      )}
    >
      treino<span className="text-primary">fácil.</span>
    </span>
  );
}
