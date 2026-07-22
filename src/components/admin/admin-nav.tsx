"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/exercises", label: "Exercícios" },
  { href: "/admin/templates", label: "Fichas" },
  { href: "/admin/catalog", label: "Catálogo" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="scrollbar-none -mx-6 flex gap-1 overflow-x-auto px-6">
      {ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
