"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Row = {
  id: string;
  name: string;
  level: string;
  muscle: string;
  isActive: boolean;
};

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

export function ExerciseList({ exercises }: { exercises: Row[] }) {
  const [q, setQ] = useState("");
  const filtered = exercises.filter((e) =>
    `${e.name} ${e.muscle}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="text-muted-foreground absolute inset-y-0 left-3 my-auto size-4" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar exercício..."
          className="h-11 rounded-xl pl-9"
        />
      </div>

      <p className="text-muted-foreground text-xs">{filtered.length} exercícios</p>

      <div className="space-y-2">
        {filtered.map((e) => (
          <Link
            key={e.id}
            href={`/admin/exercises/${e.id}`}
            className="bg-card hover:border-foreground/20 flex items-center gap-3 rounded-2xl border p-3.5 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{e.name}</p>
                {!e.isActive && (
                  <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                    inativo
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                {e.muscle} · {LEVEL_LABEL[e.level] ?? e.level}
              </p>
            </div>
            <ChevronRight className="text-muted-foreground size-5 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
