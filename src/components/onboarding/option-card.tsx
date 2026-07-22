"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Cartão de escolha única (objetivo, experiência, local…). */
export function OptionCard({
  selected,
  onClick,
  title,
  subtitle,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string | null;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all",
        selected
          ? "border-primary bg-primary/10"
          : "border-border hover:border-foreground/20 hover:bg-muted/40",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="font-semibold">{title}</div>
        {subtitle && (
          <div className="text-muted-foreground text-sm">{subtitle}</div>
        )}
      </div>
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/40",
        )}
      >
        {selected && <Check className="size-3.5" />}
      </span>
    </button>
  );
}

/** Cartão de número grande (dias, minutos). */
export function NumberTile({
  selected,
  onClick,
  value,
  unit,
}: {
  selected: boolean;
  onClick: () => void;
  value: number | string;
  unit?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-2xl border transition-all",
        selected
          ? "border-primary bg-primary/10"
          : "border-border hover:border-foreground/20 hover:bg-muted/40",
      )}
    >
      <span className="text-3xl font-bold tracking-tight">{value}</span>
      {unit && <span className="text-muted-foreground text-xs">{unit}</span>}
    </button>
  );
}

/** Chip de multisseleção (equipamentos, limitações). */
export function SelectChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all",
        selected
          ? "border-primary bg-primary/15 text-foreground"
          : "border-border text-muted-foreground hover:border-foreground/20",
      )}
    >
      {selected && <Check className="text-primary size-3.5" />}
      {children}
    </button>
  );
}
