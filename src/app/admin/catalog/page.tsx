import type { Metadata } from "next";
import { createClient } from "@/infrastructure/supabase/server";
import { CatalogManager } from "@/components/admin/catalog-manager";
import { LOOKUPS, LOOKUP_ORDER } from "@/lib/admin/lookups";

export const metadata: Metadata = { title: "Admin · Catálogo" };

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function AdminCatalogPage() {
  const supabase = await createClient();

  const sections = await Promise.all(
    LOOKUP_ORDER.map(async (table) => {
      const config = LOOKUPS[table];
      const cols = ["id", ...config.fields.map((f) => f.key)].join(", ");
      const { data } = await (supabase.from(table) as any).select(cols).order("name");
      return { config, rows: (data ?? []) as ({ id: number } & Record<string, string | null>)[] };
    }),
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Catálogo</h1>
        <p className="text-muted-foreground text-sm">
          Objetivos, grupos musculares, equipamentos, limitações e categorias.
        </p>
      </div>
      <CatalogManager sections={sections} />
    </div>
  );
}
