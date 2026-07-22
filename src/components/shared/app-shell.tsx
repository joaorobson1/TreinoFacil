import { BottomNav } from "./bottom-nav";

/**
 * Casca da área autenticada: coluna centralizada mobile-first + navegação inferior.
 * Aplicada no layout do grupo `(app)` nas FASES 4+.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main className="flex-1 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
