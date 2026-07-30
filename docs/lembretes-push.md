# Lembretes de treino (Web Push)

O app já tem tudo pronto: service worker (`public/sw.js`), inscrição no perfil,
tabela `push_subscriptions` e a Edge Function `supabase/functions/send-reminders`.
Falta só publicar a infraestrutura de envio. São 3 passos.

## 1. Gerar as chaves VAPID

```bash
node scripts/gen-vapid.mjs
```

- Copie a **pública** para o `.env.local` (e para as variáveis do deploy na Vercel):

  ```
  NEXT_PUBLIC_VAPID_PUBLIC_KEY=<chave pública>
  ```

- Guarde a **privada** para o passo 2. Ela **nunca** vai para o cliente.

## 2. Publicar a Edge Function + segredos

Com a [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase functions deploy send-reminders

supabase secrets set \
  VAPID_PUBLIC_KEY=<chave pública> \
  VAPID_PRIVATE_KEY=<chave privada> \
  VAPID_SUBJECT=mailto:voce@seudominio.com
```

(`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são injetados automaticamente.)

## 3. Agendar de hora em hora (pg_cron)

No SQL Editor do Supabase, habilite `pg_cron` e `pg_net` e rode (ver também o
comentário em `supabase/migrations/0005_push_reminders.sql`):

```sql
select cron.schedule(
  'movra-reminders', '0 * * * *', $cron$
  select net.http_post(
    url := 'https://SEU-REF.functions.supabase.co/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer SUA-SERVICE-ROLE-KEY'
    )
  );
  $cron$
);
```

## Como funciona

- O usuário ativa o lembrete no **Perfil → Lembretes** e escolhe um horário.
- O navegador cria uma inscrição de push (guardada em `push_subscriptions`).
- A cada hora o cron chama a função, que envia o push para quem escolheu aquele
  horário (fuso `America/Sao_Paulo`) e **ainda não treinou hoje**.
- Inscrições expiradas (404/410) são removidas automaticamente.

Enquanto o passo 1 não é feito, o app detecta a ausência da chave e mostra
"configuração pendente" no toggle — sem quebrar nada.
