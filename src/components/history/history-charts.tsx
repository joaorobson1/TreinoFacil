import { cn } from "@/lib/utils";

const LEVEL_CLASS = [
  "bg-muted",
  "bg-primary/30",
  "bg-primary/50",
  "bg-primary/75",
  "bg-primary",
];

/** Heatmap estilo GitHub: colunas = semanas, linhas = dias da semana. */
export function HistoryCalendar({
  weeks,
}: {
  weeks: { date: string; level: number }[][];
}) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-1">
        {weeks.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((cell, ri) =>
              cell.level < 0 ? (
                <div key={ri} className="size-3.5" />
              ) : (
                <div
                  key={ri}
                  title={cell.date}
                  className={cn("size-3.5 rounded-[3px]", LEVEL_CLASS[cell.level])}
                />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Barras de volume por semana (últimas N semanas). */
export function WeeklyVolume({
  weeks,
}: {
  weeks: { label: string; volume: number }[];
}) {
  const max = Math.max(1, ...weeks.map((w) => w.volume));
  return (
    <div className="flex h-28 items-end justify-between gap-1.5">
      {weeks.map((w, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex w-full flex-1 items-end">
            <div
              className="bg-primary/70 w-full rounded-t-md transition-all"
              style={{ height: `${Math.max(3, (w.volume / max) * 100)}%` }}
            />
          </div>
          <span className="text-muted-foreground text-[10px] tabular-nums">
            {w.label}
          </span>
        </div>
      ))}
    </div>
  );
}
