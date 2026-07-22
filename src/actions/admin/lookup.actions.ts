"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { type Result, ok, err } from "@/core/shared/result";
import { slugify } from "@/lib/slugify";
import { LOOKUPS, type LookupTable } from "@/lib/admin/lookups";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function saveLookupAction(input: {
  table: LookupTable;
  id?: number;
  values: Record<string, string>;
}): Promise<Result<null>> {
  const cfg = LOOKUPS[input.table];
  if (!cfg) return err("Tabela inválida.");

  const name = (input.values.name ?? "").trim();
  if (name.length < 2) return err("Informe o nome.");

  const row: Record<string, unknown> = {};
  for (const f of cfg.fields) {
    const v = (input.values[f.key] ?? "").trim();
    row[f.key] = v || (f.key === "name" ? name : null);
  }

  const supabase = await createClient();
  const db: any = supabase;

  if (input.id) {
    const { error } = await db.from(input.table).update(row).eq("id", input.id);
    if (error) return err("Falha ao salvar.");
  } else {
    row.slug = slugify(name);
    const { error } = await db.from(input.table).insert(row);
    if (error) {
      return err(
        error.code === "23505" ? "Já existe um item com esse nome." : "Falha ao criar.",
      );
    }
  }

  revalidatePath("/admin/catalog");
  return ok(null);
}

export async function deleteLookupAction(
  table: LookupTable,
  id: number,
): Promise<Result<null>> {
  if (!LOOKUPS[table]) return err("Tabela inválida.");
  const supabase = await createClient();
  const db: any = supabase;
  const { error } = await db.from(table).delete().eq("id", id);
  if (error) {
    return err(
      error.code === "23503"
        ? "Item em uso — não pode ser excluído."
        : "Falha ao excluir.",
    );
  }
  revalidatePath("/admin/catalog");
  return ok(null);
}
