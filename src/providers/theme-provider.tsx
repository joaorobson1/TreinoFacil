"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Wrapper do next-themes. Mantido como client component isolado para que o
 * RootLayout permaneça server component. Tema aplicado via classe `.dark`
 * (ver `@custom-variant dark` em globals.css).
 */
export function ThemeProvider(props: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props} />;
}
