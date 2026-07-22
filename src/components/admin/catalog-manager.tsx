"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteLookupAction,
  saveLookupAction,
} from "@/actions/admin/lookup.actions";
import type { LookupConfig } from "@/lib/admin/lookups";

type Row = { id: number } & Record<string, string | number | null>;

function LookupSection({ config, rows }: { config: LookupConfig; rows: Row[] }) {
  const router = useRouter();
  const [add, setAdd] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [edit, setEdit] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!(add.name ?? "").trim()) return toast.error("Informe o nome.");
    setBusy(true);
    const res = await saveLookupAction({ table: config.table, values: add });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    setAdd({});
    router.refresh();
  }
  async function save(id: number) {
    setBusy(true);
    const res = await saveLookupAction({ table: config.table, id, values: edit });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    setEditingId(null);
    router.refresh();
  }
  async function remove(id: number) {
    const res = await deleteLookupAction(config.table, id);
    if (!res.ok) return toast.error(res.error);
    router.refresh();
  }

  return (
    <section className="bg-card rounded-2xl border p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{config.label}</h2>
        <span className="text-muted-foreground text-xs">{rows.length}</span>
      </div>

      <div className="divide-border divide-y">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center gap-2 py-2">
            {editingId === r.id ? (
              <>
                {config.fields.map((f) => (
                  <Input
                    key={f.key}
                    value={edit[f.key] ?? ""}
                    onChange={(e) => setEdit((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.label}
                    className="h-9 rounded-lg"
                  />
                ))}
                <Button size="icon" variant="ghost" className="rounded-lg" onClick={() => save(r.id)} disabled={busy}>
                  <Check className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-lg" onClick={() => setEditingId(null)}>
                  <X className="size-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  {config.fields.length > 1 && (
                    <p className="text-muted-foreground truncate text-xs">
                      {config.fields
                        .slice(1)
                        .map((f) => r[f.key])
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                <Button
                  size="icon" variant="ghost" className="text-muted-foreground rounded-lg"
                  onClick={() => {
                    setEditingId(r.id);
                    setEdit(
                      Object.fromEntries(config.fields.map((f) => [f.key, String(r[f.key] ?? "")])),
                    );
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive rounded-lg" onClick={() => remove(r.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {config.fields.map((f) => (
          <Input
            key={f.key}
            value={add[f.key] ?? ""}
            onChange={(e) => setAdd((p) => ({ ...p, [f.key]: e.target.value }))}
            placeholder={f.label}
            className="h-9 rounded-lg"
          />
        ))}
        <Button size="icon" className="rounded-lg" onClick={create} disabled={busy} aria-label="Adicionar">
          <Plus className="size-4" />
        </Button>
      </div>
    </section>
  );
}

export function CatalogManager({
  sections,
}: {
  sections: { config: LookupConfig; rows: Row[] }[];
}) {
  return (
    <div className="space-y-4">
      {sections.map((s) => (
        <LookupSection key={s.config.table} config={s.config} rows={s.rows} />
      ))}
    </div>
  );
}
