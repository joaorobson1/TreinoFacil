import { cn } from "@/lib/utils";
import { formatVolume } from "@/lib/format";

const LEVEL_CLASS = [
  "bg-muted",
  "bg-primary/30",
  "bg-primary/50",
  "bg-primary/75",
  "bg-primary",
];

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const monthOf = (dateStr: string) => new Date(`${dateStr}T00:00:00`).getMonth();

/** Heatmap estilo GitHub: colunas = semanas, linhas = dias, com meses e legenda. */
export function HistoryCalendar({
  weeks,
}: {
  weeks: { date: string; level: number }[][];
}) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="min-w-max">
        {/* rótulos de mês, alinhados ao início de cada mês */}
        <div className="mb-1 flex gap-1">
          {weeks.map((col, ci) => {
            const m = monthOf(col[0].date);
            const prev = ci > 0 ? monthOf(weeks[ci - 1][0].date) : -1;
            return (
              <div key={ci} className="text-muted-foreground w-3.5 text-[9px] whitespace-nowrap">
                {m !== prev ? MONTHS[m] : ""}
              </div>
            );
          })}
        </div>

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

        {/* legenda */}
        <div className="text-muted-foreground mt-3 flex items-center justify-end gap-1 text-[10px]">
          <span>menos</span>
          {LEVEL_CLASS.map((c, i) => (
            <div key={i} className={cn("size-3 rounded-[3px]", c)} />
          ))}
          <span>mais</span>
        </div>
      </div>
    </div>
  );
}

/** Barras de volume por semana, com o valor acima de cada barra. */
export function WeeklyVolume({
  weeks,
}: {
  weeks: { label: string; volume: number }[];
}) {
  const max = Math.max(1, ...weeks.map((w) => w.volume));
  return (
    <div className="flex h-32 items-end justify-between gap-1.5">
      {weeks.map((w, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-muted-foreground h-3 text-[9px] tabular-nums">
            {w.volume > 0 ? formatVolume(w.volume) : ""}
          </span>
          <div className="flex w-full flex-1 items-end">
            <div
              className="bg-primary/70 w-full rounded-t-md transition-all"
              style={{ height: `${Math.max(3, (w.volume / max) * 100)}%` }}
            />
          </div>
          <span className="text-muted-foreground text-[10px] tabular-nums">{w.label}</span>
        </div>
      ))}
    </div>
  );
}
