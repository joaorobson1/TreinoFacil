import type { Metadata } from "next";
import { createClient } from "@/infrastructure/supabase/server";
import { ProgramMetaForm } from "@/components/admin/program-meta-form";

export const metadata: Metadata = { title: "Admin · Novo programa" };

export default async function NewProgramPage() {
  const supabase = await createClient();
  const { data: goals } = await supabase
    .from("goals")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold tracking-tight">Novo programa</h1>
      <p className="text-muted-foreground text-sm">
        Defina objetivo e experiência. Depois de criar, monte as fases (cada fase usa uma ficha e
        avança automaticamente quando o critério é atingido).
      </p>
      <ProgramMetaForm goals={goals ?? []} />
    </div>
  );
}
