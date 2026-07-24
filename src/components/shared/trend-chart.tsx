/**
 * Gráfico de linha leve em SVG (sem dependência externa). Recebe pontos em
 * ordem cronológica e desenha linha + área + destaque no último ponto.
 * Responsivo via viewBox; usa as cores do tema (currentColor / --primary).
 */
export function TrendChart({
  points,
  unit = "",
  className,
}: {
  points: { label: string; value: number }[];
  unit?: string;
  className?: string;
}) {
  const W = 320;
  const H = 120;
  const pad = { top: 12, right: 12, bottom: 12, left: 12 };

  if (points.length < 2) {
    return (
      <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
        Registre pelo menos duas medidas para ver a evolução.
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const x = (i: number) => pad.left + (i / (points.length - 1)) * innerW;
  const y = (v: number) => pad.top + (1 - (v - min) / span) * innerH;

  const line = points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ");
  const area = `${pad.left},${pad.top + innerH} ${line} ${pad.left + innerW},${pad.top + innerH}`;
  const last = points[points.length - 1];

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Evolução: de ${values[0]} a ${last.value} ${unit}`}
      >
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#trend-fill)" />
        <polyline
          points={line}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={x(points.length - 1)} cy={y(last.value)} r={3.5} fill="var(--primary)" />
      </svg>
      <div className="text-muted-foreground mt-1 flex justify-between text-[10px]">
        <span>{points[0].label}</span>
        <span>{last.label}</span>
      </div>
    </div>
  );
}
