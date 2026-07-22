"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Dumbbell, House, LineChart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";

const NAV_ITEMS = [
  { href: ROUTES.dashboard, label: "Início", icon: House },
  { href: ROUTES.workout, label: "Treino", icon: Dumbbell },
  { href: ROUTES.progress, label: "Progresso", icon: LineChart },
  { href: ROUTES.history, label: "Histórico", icon: CalendarDays },
  { href: ROUTES.profile, label: "Perfil", icon: User },
];

/**
 * Navegação inferior fixa (mobile-first) da área autenticada.
 * Usada pelo AppShell nas FASES 4+.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-background/80 supports-[backdrop-filter]:bg-background/60 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-md items-stretch justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("size-5", active && "stroke-[2.5]")} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
