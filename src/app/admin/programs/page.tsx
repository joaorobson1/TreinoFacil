import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Programas" };

const EXPERIENCE: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

export default async function AdminProgramsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("programs")
    .select("id, name, experience, is_active, goals(name), program_phases(id)")
    .order("name");

  const programs = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Programas</h1>
        <Link href="/admin/programs/new" className={cn(buttonVariants(), "h-10 rounded-xl")}>
          <Plus className="size-4" />
          Novo
        </Link>
      </div>

      <p className="text-muted-foreground text-xs">{programs.length} programas</p>

      <div className="space-y-2">
        {programs.map((p) => (
          <Link
            key={p.id}
            href={`/admin/programs/${p.id}`}
            className="bg-card hover:border-foreground/20 flex items-center gap-3 rounded-2xl border p-3.5 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{p.name}</p>
                {!p.is_active && (
                  <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                    inativo
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                {p.goals?.name ?? "—"} · {EXPERIENCE[p.experience] ?? p.experience} ·{" "}
                {p.program_phases?.length ?? 0} fases
              </p>
            </div>
            <ChevronRight className="text-muted-foreground size-5 shrink-0" />
          </Link>
        ))}
        {programs.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nenhum programa ainda. Crie o primeiro para ativar a progressão automática.
          </p>
        )}
      </div>
    </div>
  );
}
