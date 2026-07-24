import type { Metadata } from "next";
import Link from "next/link";
import { Layers, Plus } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { AdminList, type AdminListItem } from "@/components/admin/admin-list";
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

  const items: AdminListItem[] = (data ?? []).map((p) => ({
    id: p.id,
    href: `/admin/programs/${p.id}`,
    title: p.name,
    subtitle: `${p.goals?.name ?? "—"} · ${EXPERIENCE[p.experience] ?? p.experience} · ${p.program_phases?.length ?? 0} fases`,
    inactive: !p.is_active,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Programas</h1>
        <Link href="/admin/programs/new" className={cn(buttonVariants(), "h-10 rounded-xl")}>
          <Plus className="size-4" />
          Novo
        </Link>
      </div>

      <AdminList
        items={items}
        noun="programas"
        icon={Layers}
        emptyTitle="Nenhum programa ainda"
        emptyHint="Crie o primeiro programa para ativar a progressão automática de fases."
      />
    </div>
  );
}
