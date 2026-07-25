"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  deleteMyAccountAction,
  exportMyDataAction,
} from "@/actions/account.actions";

export function AccountActions() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);

  async function exportData() {
    setExporting(true);
    const res = await exportMyDataAction();
    setExporting(false);
    if (!res.ok) return toast.error(res.error);

    const blob = new Blob([JSON.stringify(res.value.data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "treinofacil-meus-dados.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Seus dados foram exportados.");
  }

  async function remove() {
    const res = await deleteMyAccountAction();
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Conta excluída.");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        onClick={exportData}
        disabled={exporting}
        className="h-11 w-full rounded-2xl font-medium"
      >
        {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Exportar meus dados
      </Button>

      <ConfirmDialog
        title="Excluir sua conta?"
        description="Esta ação é permanente e apaga todos os seus dados — perfil, treinos, medidas, evolução e conquistas. Não é possível desfazer."
        confirmLabel="Excluir minha conta"
        onConfirm={remove}
        trigger={
          <Button
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 h-11 w-full rounded-2xl font-medium"
          >
            <Trash2 className="size-4" />
            Excluir conta
          </Button>
        }
      />
    </div>
  );
}
