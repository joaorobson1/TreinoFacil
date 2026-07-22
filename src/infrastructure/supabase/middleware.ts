import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/env";
import {
  AUTH_PREFIXES,
  PROTECTED_PREFIXES,
  ROUTES,
  matchesPrefix,
} from "@/lib/routes";

/**
 * Refresh de sessão + guards de rota. Rodado pelo `middleware.ts` da raiz.
 *
 * IMPORTANTE (padrão Supabase SSR): sempre retornar o `supabaseResponse` para
 * que os cookies renovados cheguem ao browser. Não inserir lógica entre criar o
 * cliente e chamar `getUser()`.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Sem credenciais reais (placeholders), não há o que autenticar — segue direto.
  if (!isSupabaseConfigured) return supabaseResponse;

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Não autenticado tentando acessar área protegida → login.
  if (!user && matchesPrefix(pathname, PROTECTED_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.login;
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Autenticado em página de auth → dashboard.
  if (user && matchesPrefix(pathname, AUTH_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.dashboard;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
