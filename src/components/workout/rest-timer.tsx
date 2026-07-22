"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REST_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function vibrate(ms: number) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(ms);
  }
}

export function RestTimer({
  open,
  seconds,
  onDismiss,
}: {
  open: boolean;
  seconds: number;
  onDismiss: () => void;
}) {
  const [total, setTotal] = useState(seconds);
  const [remaining, setRemaining] = useState(seconds);

  // reinicia ao abrir
  useEffect(() => {
    if (open) {
      setTotal(seconds);
      setRemaining(seconds);
    }
  }, [open, seconds]);

  // contagem regressiva
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          vibrate(220);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [open]);

  const adjust = (delta: number) => {
    setRemaining((r) => Math.max(0, r + delta));
    setTotal((t) => Math.max(1, t + delta));
  };
  const preset = (s: number) => {
    setTotal(s);
    setRemaining(s);
  };

  const size = 168;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? remaining / total : 0;
  const done = remaining === 0;
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDismiss}
          />
          <motion.div
            className="bg-background fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl border-t p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <div className="bg-muted mx-auto mb-6 h-1.5 w-10 rounded-full" />
            <p className="text-muted-foreground text-center text-sm font-medium">
              {done ? "Descanso concluído" : "Descanso"}
            </p>

            <div className="relative mx-auto mt-4" style={{ width: size, height: size }}>
              <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-muted" />
                <motion.circle
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  className={cn("fill-none", done ? "stroke-primary" : "stroke-primary")}
                  strokeDasharray={c}
                  animate={{ strokeDashoffset: c * (1 - pct) }}
                  transition={{ duration: 0.9, ease: "linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold tabular-nums">
                  {mm > 0 ? `${mm}:${String(ss).padStart(2, "0")}` : ss}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <Button variant="outline" size="icon-lg" className="rounded-full" onClick={() => adjust(-15)} aria-label="-15s">
                <Minus className="size-5" />
              </Button>
              <div className="flex gap-2">
                {REST_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => preset(s)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      total === s
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {s}s
                  </button>
                ))}
              </div>
              <Button variant="outline" size="icon-lg" className="rounded-full" onClick={() => adjust(15)} aria-label="+15s">
                <Plus className="size-5" />
              </Button>
            </div>

            <Button onClick={onDismiss} className="mt-6 h-12 w-full rounded-2xl text-base font-semibold">
              <Check className="size-5" />
              {done ? "Continuar" : "Pular descanso"}
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
