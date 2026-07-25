"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { VAPID_PUBLIC_KEY } from "@/lib/env";
import {
  disableReminderAction,
  saveReminderAction,
} from "@/actions/reminder.actions";

const HOURS = [6, 7, 8, 12, 17, 18, 19, 20, 21];

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function ReminderToggle({
  enabled,
  hour,
}: {
  enabled: boolean;
  hour: number | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [selectedHour, setSelectedHour] = useState(hour ?? 19);

  const configured = VAPID_PUBLIC_KEY.length > 0;
  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  async function enable(h: number) {
    if (!configured) return toast.error("Lembretes ainda não configurados no app.");
    if (!supported) return toast.error("Seu navegador não suporta notificações.");
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Permissão de notificação negada.");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const json = sub.toJSON();
      const res = await saveReminderAction({
        endpoint: json.endpoint ?? "",
        p256dh: json.keys?.p256dh ?? "",
        auth: json.keys?.auth ?? "",
        hour: h,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Lembrete ativado para as ${h}h.`);
      router.refresh();
    } catch {
      toast.error("Não foi possível ativar os lembretes.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    const res = await disableReminderAction();
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Lembretes desativados.");
    router.refresh();
  }

  return (
    <div className="bg-card rounded-2xl border p-4">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
          {enabled ? <Bell className="size-5" /> : <BellOff className="size-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Lembrete de treino</p>
          <p className="text-muted-foreground text-sm">
            {enabled ? `Todo dia às ${hour ?? selectedHour}h` : "Uma notificação diária para não perder o ritmo"}
          </p>
        </div>
      </div>

      {!configured ? (
        <p className="text-muted-foreground mt-3 text-xs">
          Recurso indisponível: configuração de push pendente.
        </p>
      ) : enabled ? (
        <Button variant="outline" onClick={disable} disabled={busy} className="mt-3 h-10 w-full rounded-xl">
          {busy ? <Loader2 className="size-4 animate-spin" /> : "Desativar lembrete"}
        </Button>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <select
            value={selectedHour}
            onChange={(e) => setSelectedHour(Number(e.target.value))}
            className="border-input bg-background h-10 rounded-xl border px-3 text-sm outline-none focus-visible:border-ring"
            aria-label="Horário do lembrete"
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>{h}h</option>
            ))}
          </select>
          <Button onClick={() => enable(selectedHour)} disabled={busy} className="h-10 flex-1 rounded-xl font-medium">
            {busy ? <Loader2 className="size-4 animate-spin" /> : "Ativar lembrete"}
          </Button>
        </div>
      )}
    </div>
  );
}
