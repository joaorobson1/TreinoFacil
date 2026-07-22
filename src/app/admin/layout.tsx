import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AdminNav } from "@/components/admin/admin-nav";
import { ROUTES } from "@/lib/routes";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  const { data: me } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (me?.role !== "admin") redirect(ROUTES.dashboard);

  return (
    <div className="min-h-dvh">
      <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="mx-auto w-full max-w-3xl px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Logo />
              <span className="bg-primary/15 text-primary rounded-full px-2 py-0.5 text-xs font-semibold">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={ROUTES.dashboard}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm font-medium"
              >
                <ArrowLeft className="size-4" />
                App
              </Link>
              <ThemeToggle />
            </div>
          </div>
          <div className="pb-3">
            <AdminNav />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-6 py-6">{children}</main>
    </div>
  );
}
