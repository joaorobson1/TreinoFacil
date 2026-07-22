/**
 * Rotas centralizadas + classificação para os guards do middleware.
 * As telas em si são construídas nas FASES 3+.
 */
export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  workout: "/workout",
  session: "/session",
  history: "/history",
  progress: "/progress",
  measurements: "/measurements",
  programs: "/programs",
  achievements: "/achievements",
  profile: "/profile",
  admin: "/admin",
} as const;

/** Rotas que exigem sessão autenticada. */
export const PROTECTED_PREFIXES = [
  ROUTES.dashboard,
  ROUTES.workout,
  ROUTES.session,
  ROUTES.history,
  ROUTES.progress,
  ROUTES.measurements,
  ROUTES.programs,
  ROUTES.achievements,
  ROUTES.profile,
  ROUTES.onboarding,
  ROUTES.admin,
];

/** Rotas de autenticação — redirecionam para o app quando já há sessão. */
export const AUTH_PREFIXES = [ROUTES.login, ROUTES.signup];

/** Rotas exclusivas de administrador. */
export const ADMIN_PREFIXES = [ROUTES.admin];

export function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
