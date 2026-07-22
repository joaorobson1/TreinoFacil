"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

/** Anel de progresso do streak (estilo Activity Rings). */
export function StreakRing({
  streak,
  record,
  milestone = 7,
}: {
  streak: number;
  record: number;
  milestone?: number;
}) {
  const size = 140;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(streak / milestone, 1);
  const offset = c * (1 - pct);

  return (
    <div className="bg-card flex items-center gap-5 rounded-3xl border p-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            className="fill-none stroke-muted"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            strokeLinecap="round"
            className="fill-none stroke-primary"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tabular-nums">{streak}</span>
          <span className="text-muted-foreground text-xs">
            {streak === 1 ? "dia" : "dias"}
          </span>
        </div>
      </div>

      <div className="min-w-0">
        <div className="text-primary flex items-center gap-1.5 font-semibold">
          <Flame className="size-4" />
          Sequência
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          {streak === 0
            ? "Comece hoje e construa sua sequência."
            : `Você está treinando há ${streak} ${streak === 1 ? "dia" : "dias"} seguidos.`}
        </p>
        <p className="text-muted-foreground mt-3 text-xs">
          Recorde: <span className="text-foreground font-medium">{record} dias</span>
        </p>
      </div>
    </div>
  );
}
