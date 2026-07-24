import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { LEGAL_PENDING } from "@/lib/legal";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-4">
          <Logo />
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm font-medium"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-6 py-8">
        {LEGAL_PENDING && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-500" />
            <p className="text-sm">
              <strong>Documento incompleto.</strong> Preencha os dados do
              responsável em <code>src/lib/legal.ts</code> antes de publicar o app.
            </p>
          </div>
        )}
        <article className="prose-legal space-y-5 text-sm leading-relaxed">
          {children}
        </article>
      </main>
    </div>
  );
}
