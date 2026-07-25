"use client";

import { useEffect } from "react";

/** Registra o service worker (necessário para Web Push). Silencioso e idempotente. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // registro é best-effort; sem SW os lembretes simplesmente não ficam disponíveis
    });
  }, []);
  return null;
}
