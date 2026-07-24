"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export type AdminListItem = {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  inactive?: boolean;
};

/**
 * Lista administrativa reutilizável: busca client-side, contagem e estados
 * vazios (sem itens / sem resultado). Padroniza fichas, programas e conquistas.
 */
export function AdminList({
  items,
  noun,
  icon: Icon,
  emptyTitle,
  emptyHint,
}: {
  items: AdminListItem[];
  /** substantivo plural, ex.: "fichas" — usado na busca e na contagem */
  noun: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyHint: string;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((i) =>
      `${i.title} ${i.subtitle}`.toLowerCase().includes(term),
    );
  }, [items, q]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-12 text-center">
        <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-2xl">
          <Icon className="size-6" />
        </div>
        <div className="space-y-1 px-6">
          <p className="font-semibold">{emptyTitle}</p>
          <p className="text-muted-foreground text-sm text-pretty">{emptyHint}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="text-muted-foreground absolute inset-y-0 left-3 my-auto size-4" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Buscar ${noun}...`}
          className="h-11 rounded-xl pl-9"
        />
      </div>

      <p className="text-muted-foreground text-xs">
        {filtered.length} {noun}
        {q && ` · de ${items.length}`}
      </p>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          Nenhum resultado para “{q}”.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((i) => (
            <Link
              key={i.id}
              href={i.href}
              className="bg-card hover:border-foreground/20 flex items-center gap-3 rounded-2xl border p-3.5 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{i.title}</p>
                  {i.inactive && (
                    <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                      inativo
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground truncate text-sm">{i.subtitle}</p>
              </div>
              <ChevronRight className="text-muted-foreground size-5 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
