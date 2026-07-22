import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ROUTES } from "@/lib/routes";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div
        aria-hidden
        className="bg-primary/15 pointer-events-none absolute -top-40 left-1/2 size-[32rem] -translate-x-1/2 rounded-full blur-[120px]"
      />
      <header className="relative z-10 mx-auto flex w-full max-w-md items-center justify-between px-6 pt-6">
        <Link href={ROUTES.home}>
          <Logo />
        </Link>
        <ThemeToggle />
      </header>
      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-8">
        {children}
      </main>
    </div>
  );
}
