import type { Metadata } from "next";
import { AchievementForm } from "@/components/admin/achievement-form";

export const metadata: Metadata = { title: "Admin · Nova conquista" };

export default function NewAchievementPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold tracking-tight">Nova conquista</h1>
      <AchievementForm />
    </div>
  );
}
