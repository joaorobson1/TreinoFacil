// Edge Function (Deno) — envia os lembretes de treino via Web Push.
// Deploy: `supabase functions deploy send-reminders`
// Segredos necessários (supabase secrets set ...):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (ex.: mailto:voce@dominio.com)
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já são injetados pelo runtime.
//
// Agendar de hora em hora com pg_cron (ver supabase/migrations/0005_push_reminders.sql).
// A função decide quem recebe: lembrete no horário local (America/Sao_Paulo) e
// quem ainda não treinou hoje.

import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

// deno-lint-ignore no-explicit-any
const env = (k: string) => (globalThis as any).Deno.env.get(k) as string;

const SP_TZ = "America/Sao_Paulo";
const partsInTz = (d: Date) => {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: SP_TZ,
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23",
  });
  const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) };
};

Deno.serve(async () => {
  const supabase = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));
  webpush.setVapidDetails(
    env("VAPID_SUBJECT") || "mailto:admin@movra.app",
    env("VAPID_PUBLIC_KEY"),
    env("VAPID_PRIVATE_KEY"),
  );

  const now = new Date();
  const { date: today, hour } = partsInTz(now);

  const { data: users, error } = await supabase
    .from("users")
    .select("id, reminder_hour, push_subscriptions(endpoint, p256dh, auth)")
    .eq("reminders_enabled", true)
    .eq("reminder_hour", hour);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  let sent = 0;
  let skipped = 0;

  for (const u of users ?? []) {
    const subs = (u.push_subscriptions ?? []) as { endpoint: string; p256dh: string; auth: string }[];
    if (subs.length === 0) continue;

    // já treinou hoje? então não incomoda
    const { count } = await supabase
      .from("completed_workouts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", u.id)
      .gte("completed_at", `${today}T00:00:00-03:00`);
    if ((count ?? 0) > 0) { skipped++; continue; }

    const payload = JSON.stringify({
      title: "Hora de treinar 💪",
      body: "Seu treino de hoje está esperando. Bora?",
      url: "/workout",
      tag: "treino-reminder",
    });

    for (const s of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        );
        sent++;
      } catch (err) {
        // inscrição expirada/inválida → remove
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
        }
      }
    }
  }

  return new Response(JSON.stringify({ hour, sent, skipped }), {
    headers: { "Content-Type": "application/json" },
  });
});
