import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Fichas" };

export default async function AdminTemplatesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workout_templates")
    .select("id, name, days_per_week, is_active, goals(name)")
    .order("name");

  const templates = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Fichas</h1>
        <Link href="/admin/templates/new" className={cn(buttonVariants(), "h-10 rounded-xl")}>
          <Plus className="size-4" />
          Nova
        </Link>
      </div>

      <p className="text-muted-foreground text-xs">{templates.length} fichas</p>

      <div className="space-y-2">
        {templates.map((t) => (
          <Link
            key={t.id}
            href={`/admin/templates/${t.id}`}
            className="bg-card hover:border-foreground/20 flex items-center gap-3 rounded-2xl border p-3.5 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{t.name}</p>
                {!t.is_active && (
                  <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                    inativa
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                {t.goals?.name ?? "—"} · {t.days_per_week} dias
              </p>
            </div>
            <ChevronRight className="text-muted-foreground size-5 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
