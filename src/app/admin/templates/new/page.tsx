import type { Metadata } from "next";
import { createClient } from "@/infrastructure/supabase/server";
import { TemplateMetaForm } from "@/components/admin/template-meta-form";

export const metadata: Metadata = { title: "Admin · Nova ficha" };

export default async function NewTemplatePage() {
  const supabase = await createClient();
  const { data: goals } = await supabase
    .from("goals")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold tracking-tight">Nova ficha</h1>
      <TemplateMetaForm goals={goals ?? []} />
    </div>
  );
}
