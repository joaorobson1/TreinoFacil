import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Trophy } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { AdminList, type AdminListItem } from "@/components/admin/admin-list";
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

  const items: AdminListItem[] = (data ?? []).map((a) => ({
    id: String(a.id),
    href: `/admin/achievements/${a.id}`,
    title: a.name,
    subtitle: `${label(a.criteria)} · meta ${a.threshold}`,
    inactive: !a.is_active,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Conquistas</h1>
        <Link href="/admin/achievements/new" className={cn(buttonVariants(), "h-10 rounded-xl")}>
          <Plus className="size-4" />
          Nova
        </Link>
      </div>

      <AdminList
        items={items}
        noun="conquistas"
        icon={Trophy}
        emptyTitle="Nenhuma conquista ainda"
        emptyHint="Crie conquistas para engajar os usuários conforme eles treinam."
      />
    </div>
  );
}
