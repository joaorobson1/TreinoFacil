import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { ACHIEVEMENT_CRITERIA } from "@/lib/validations/achievement";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Conquistas" };

export default async function AdminAchievementsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("achievements")
    .select("id, name, criteria, threshold, is_active")
    .order("sort_order");

  const label = (c: string) =>
    ACHIEVEMENT_CRITERIA.find((x) => x.value === c)?.label ?? c;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Conquistas</h1>
        <Link href="/admin/achievements/new" className={cn(buttonVariants(), "h-10 rounded-xl")}>
          <Plus className="size-4" />
          Nova
        </Link>
      </div>

      <div className="space-y-2">
        {(data ?? []).map((a) => (
          <Link
            key={a.id}
            href={`/admin/achievements/${a.id}`}
            className="bg-card hover:border-foreground/20 flex items-center gap-3 rounded-2xl border p-3.5 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{a.name}</p>
                {!a.is_active && (
                  <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                    inativa
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                {label(a.criteria)} · meta {a.threshold}
              </p>
            </div>
            <ChevronRight className="text-muted-foreground size-5 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
