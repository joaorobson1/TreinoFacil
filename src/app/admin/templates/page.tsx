import type { Metadata } from "next";
import Link from "next/link";
import { Dumbbell, Plus } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { AdminList, type AdminListItem } from "@/components/admin/admin-list";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Fichas" };

export default async function AdminTemplatesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workout_templates")
    .select("id, name, days_per_week, is_active, goals(name)")
    .order("name");

  const items: AdminListItem[] = (data ?? []).map((t) => ({
    id: t.id,
    href: `/admin/templates/${t.id}`,
    title: t.name,
    subtitle: `${t.goals?.name ?? "—"} · ${t.days_per_week} dias`,
    inactive: !t.is_active,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Fichas</h1>
        <Link href="/admin/templates/new" className={cn(buttonVariants(), "h-10 rounded-xl")}>
          <Plus className="size-4" />
          Nova
        </Link>
      </div>

      <AdminList
        items={items}
        noun="fichas"
        icon={Dumbbell}
        emptyTitle="Nenhuma ficha ainda"
        emptyHint="Crie a primeira ficha para que o algoritmo tenha o que atribuir aos usuários."
      />
    </div>
  );
}
