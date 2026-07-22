import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import {
  type AchievementView,
  AchievementBadge,
} from "@/components/gamification/achievement-badge";
import type { AchievementCriteria } from "@/core/domain/enums";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Conquistas" };

type Stats = {
  total_workouts: number;
  total_sets: number;
  total_volume_kg: number;
  longest_streak: number;
};

function progressFor(
  criteria: AchievementCriteria,
  threshold: number,
  s: Stats,
): { current: number; target: number } | null {
  switch (criteria) {
    case "first_workout":
    case "total_workouts":
      return { current: s.total_workouts, target: threshold };
    case "consecutive_days":
      return { current: s.longest_streak, target: threshold };
    case "total_volume_kg":
      return { current: Number(s.total_volume_kg), target: threshold };
    case "total_sets":
      return { current: s.total_sets, target: threshold };
    default:
      return null;
  }
}

export default async function AchievementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  const [{ data: achievements }, { data: owned }, { data: stats }] = await Promise.all([
    supabase
      .from("achievements")
      .select("id, slug, name, description, icon, criteria, threshold")
      .eq("is_active", true)
      .order("sort_order"),
    supabase.from("user_achievements").select("achievement_id").eq("user_id", user.id),
    supabase
      .from("user_stats")
      .select("total_workouts, total_sets, total_volume_kg, longest_streak")
      .eq("user_id", user.id)
      .single(),
  ]);

  const ownedIds = new Set((owned ?? []).map((o) => o.achievement_id));
  const s: Stats = {
    total_workouts: stats?.total_workouts ?? 0,
    total_sets: stats?.total_sets ?? 0,
    total_volume_kg: Number(stats?.total_volume_kg ?? 0),
    longest_streak: stats?.longest_streak ?? 0,
  };

  const views: AchievementView[] = (achievements ?? []).map((a) => {
    const unlocked = ownedIds.has(a.id);
    return {
      slug: a.slug,
      name: a.name,
      description: a.description,
      icon: a.icon,
      unlocked,
      progress: unlocked ? null : progressFor(a.criteria, Number(a.threshold), s),
    };
  });

  const unlockedCount = views.filter((v) => v.unlocked).length;

  return (
    <div className="mx-auto w-full max-w-md px-6 pt-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Conquistas</h1>
        <p className="text-muted-foreground mt-1">
          {unlockedCount} de {views.length} desbloqueadas
        </p>
      </div>
      <div className="space-y-2.5">
        {views.map((a) => (
          <AchievementBadge key={a.slug} a={a} />
        ))}
      </div>
    </div>
  );
}
