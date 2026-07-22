"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type PickerExercise = { id: string; name: string; muscle: string };

// ordem de exibição dos grupos (os não listados vão para o fim, em ordem alfabética)
const MUSCLE_ORDER = [
  "Peito",
  "Costas",
  "Ombros",
  "Bíceps",
  "Tríceps",
  "Antebraço",
  "Quadríceps",
  "Posteriores de coxa",
  "Glúteos",
  "Panturrilha",
  "Abdômen",
];

function muscleRank(m: string) {
  const i = MUSCLE_ORDER.indexOf(m);
  return i === -1 ? MUSCLE_ORDER.length : i;
}

export function ExercisePicker({
  catalog,
  value,
  onChange,
}: {
  catalog: PickerExercise[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const selected = catalog.find((c) => c.id === value);

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = term
      ? catalog.filter((c) => `${c.name} ${c.muscle}`.toLowerCase().includes(term))
      : catalog;
    const map = new Map<string, PickerExercise[]>();
    for (const c of filtered) map.set(c.muscle, [...(map.get(c.muscle) ?? []), c]);
    return [...map.entries()].sort(
      (a, b) => muscleRank(a[0]) - muscleRank(b[0]) || a[0].localeCompare(b[0]),
    );
  }, [catalog, q]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-input bg-background flex h-10 w-full items-center gap-2 rounded-lg border px-3 text-left text-sm"
      >
        <span className={cn("flex-1 truncate", !selected && "text-muted-foreground")}>
          {selected ? selected.name : "Escolha um exercício"}
        </span>
        <ChevronDown className="text-muted-foreground size-4 shrink-0" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="bg-background fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[80dvh] max-w-md flex-col rounded-t-3xl border-t"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
            >
              <div className="shrink-0 p-4 pb-2">
                <div className="bg-muted mx-auto mb-4 h-1.5 w-10 rounded-full" />
                <div className="relative">
                  <Search className="text-muted-foreground absolute inset-y-0 left-3 my-auto size-4" />
                  <Input
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar por nome ou músculo..."
                    className="h-11 rounded-xl pl-9"
                  />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {groups.length === 0 && (
                  <p className="text-muted-foreground py-8 text-center text-sm">
                    Nenhum exercício encontrado.
                  </p>
                )}
                {groups.map(([muscle, items]) => (
                  <div key={muscle} className="mb-4">
                    <p className="text-muted-foreground bg-background sticky top-0 py-1.5 text-xs font-semibold tracking-wide uppercase">
                      {muscle}
                    </p>
                    <div className="space-y-1">
                      {items.map((c) => {
                        const isSel = c.id === value;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              onChange(c.id);
                              setOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                              isSel ? "bg-primary/10 text-foreground" : "hover:bg-muted",
                            )}
                          >
                            <span className="flex-1 truncate font-medium">{c.name}</span>
                            {isSel && <Check className="text-primary size-4 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
