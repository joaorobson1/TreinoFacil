"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ROUTES } from "@/lib/routes";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
} as const;

export default function LandingPage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden">
      {/* Glow do accent ao fundo */}
      <div
        aria-hidden
        className="bg-primary/20 pointer-events-none absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full blur-[120px]"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-md items-center justify-between px-6 pt-6">
        <Logo />
        <ThemeToggle />
      </header>

      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-10"
      >
        <motion.div variants={item} className="mb-8 flex justify-center">
          <div className="ring-primary/10 rounded-[2rem] bg-white p-4 shadow-xl shadow-black/10 ring-1">
            <Image
              src="/logotreinofacil.png"
              alt="TreinoFácil — Treine melhor. Evolua sempre."
              width={512}
              height={512}
              priority
              className="size-36 object-contain"
            />
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="border-border/60 bg-muted/40 text-muted-foreground mb-8 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur"
        >
          <Dumbbell className="text-primary size-3.5" />
          Treinos por regras, sem IA
        </motion.div>

        <motion.h1
          variants={item}
          className="text-foreground text-5xl leading-[1.05] font-bold tracking-tight text-balance"
        >
          Seu treino,
          <br />
          do seu <span className="text-primary">jeito</span>.
        </motion.h1>

        <motion.p
          variants={item}
          className="text-muted-foreground mt-5 text-lg leading-relaxed text-pretty"
        >
          Uma ficha personalizada para o seu objetivo, nível, tempo e
          equipamentos — montada na hora, direto ao ponto.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-col gap-3">
          <Link
            href={ROUTES.signup}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-14 rounded-2xl text-base font-semibold",
            )}
          >
            Começar agora
            <ArrowRight className="size-5" />
          </Link>
          <Link
            href={ROUTES.login}
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "h-12 rounded-2xl text-base",
            )}
          >
            Já tenho conta
          </Link>
        </motion.div>
      </motion.main>
    </div>
  );
}
