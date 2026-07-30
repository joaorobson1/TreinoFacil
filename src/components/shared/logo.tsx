import { cn } from "@/lib/utils";

/** Marca do Movra — wordmark caixa-alta com o "A" final no accent da marca. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        // -mr compensa o espaço que o tracking adiciona depois da última letra,
        // senão o wordmark fica visualmente descolado à direita.
        "font-heading -mr-[0.18em] text-2xl font-bold tracking-[0.18em]",
        className,
      )}
    >
      MOVR<span className="text-primary">A</span>
    </span>
  );
}
